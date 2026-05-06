const Cart = require("../../models/cart.js");
const { createPrintJob } = require("../../utils/luluClient.js");
const axios = require("axios");
const pdfParse = require("pdf-parse");
const { PDFDocument } = require("pdf-lib");
const Stripe = require("stripe");
const { configurations } = require("../../configs/config.js");
const user = require("../../models/user.js");
const stripe = Stripe(configurations.stripeSecretKey);

// helper: get page count from a remote PDF URL
async function getPdfPageCount(url) {
  try {
    const resp = await axios.get(url, { responseType: "arraybuffer" });
    const ab = resp.data;
    const buffer = Buffer.isBuffer(ab) ? ab : Buffer.from(ab);

    // Prefer pdf-lib (handles many PDFs reliably)
    try {
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = doc.getPages().length;
      if (Number.isFinite(count) && count > 0) return count;
    } catch (e) {
      console.warn("pdf-lib failed to read pages:", e?.message || e);
    }

    // Fallback to pdf-parse
    try {
      const parsed = await pdfParse(buffer);
      const count = Number(parsed?.numpages || parsed?.numPages || 0);
      if (Number.isFinite(count) && count > 0) return count;
    } catch (e) {
      console.warn("pdf-parse failed to read pages:", e?.message || e);
    }

    console.warn("Page count detection returned 0 for URL:", url);
    return 0;
  } catch (err) {
    console.error("PDF page count error:", err?.message || err);
    return 0;
  }
}

// POST /user/cart -> create cart item
const createCartItem = async (req, res) => {
  try {
    const { id: userId } = req.decoded;
    const {
      title,
      name,
      email,
      pdfUrl,
      coverPdfUrl,
      shipping_address,
      shipping_option,
      pod_package_id,
      quantity,
      total_price,
      currency,
    } = req.body || {};

    if (!pdfUrl) return res.status(400).json({ message: "pdfUrl is required", error: "Missing pdfUrl" });
    if (!shipping_address) return res.status(400).json({ message: "shipping_address is required", error: "Missing shipping_address" });

    const pageCount = await getPdfPageCount(pdfUrl);

      // Determine binding code from request if available (pod package id includes binding code)
      const bindingFromBody = (req.body && (req.body.binding || req.body.pod_package_id || req.body.podPackageId || req.body.podId)) || undefined;
      const detectBinding = (value) => {
        if (!value) return null;
        const v = String(value);
        // Known binding codes: PB (Perfect Bound), CW (Case Wrap), SS (Saddle Stitch), CO (Coil Bound)
        if (v.includes('PB')) return 'PB';
        if (v.includes('CW')) return 'CW';
        if (v.includes('SS')) return 'SS';
        if (v.includes('CO')) return 'CO';
        return null;
      };

      const binding = req.body && req.body.binding ? String(req.body.binding) : detectBinding(bindingFromBody);

      // Allowed page ranges per binding
      const bindingRanges = {
        PB: { name: 'Perfect Bound', min: 32, max: 800 },
        CW: { name: 'Case Wrap', min: 24, max: 800 },
        SS: { name: 'Saddle Stitch', min: 4, max: 48 },
        CO: { name: 'Coil Bound', min: 2, max: 470 },
      };

      // If we detected a binding and page count is known, enforce range
      if (binding && bindingRanges[binding]) {
        const { name, min, max } = bindingRanges[binding];
        if (!Number.isFinite(pageCount) || pageCount === 0) {
          return res.status(400).json({
            message: `Unable to detect page count reliably. Please regenerate the PDF and try again for ${name}.`,
            error: 'Invalid page count',
          });
        }
        if (pageCount < min || pageCount > max) {
          return res.status(400).json({
            message: `Detected PDF has ${pageCount} pages which is incompatible with ${name}. Allowed page range: ${min}-${max} pages. Please edit the book and generate the PDF again.`,
            error: 'Page count out of range for binding',
          });
        }
      }

    const cart = await Cart.create({
      userId,
      title: title || undefined,
      name: name || (shipping_address && shipping_address.name) || undefined,
      email: email || undefined,
      pdfUrl,
      coverPdfUrl: coverPdfUrl || undefined,
      shipping_address,
      shipping_option: shipping_option || undefined,
      pod_package_id: pod_package_id || undefined,
      quantity: Number(quantity) || 1,
      page_count: pageCount,
      total_price: Number(total_price) + (Number(total_price) * (Number(process.env.BOOK_PRICE_PERCENTAGE) / 100)) || 0,
      currency: currency || "",
      status: "ready",
    });

    return res.status(201).json({ message: "Cart item created", response: { data: cart }, error: null });
  } catch (err) {
    console.error("Create cart item error:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// GET /user/cart -> list user's cart items
const getMyCart = async (req, res) => {
  try {
    const { id: userId } = req.decoded;
    const items = await Cart.find({ userId }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ message: "Cart fetched", response: { data: items }, error: null });
  } catch (err) {
    console.error("Get cart error:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};
                                                                        
// POST /user/cart/:id/send -> send cart item to Lulu (create print job)
const sendCartToPrint = async (req, res) => {
  try {
    const { id: userId } = req.decoded;
    const { id } = req.params;
    const { contact_email, production_delay } = req.body || {};

    const cart = await Cart.findOne({ _id: id, userId }).lean();
    if (!cart) return res.status(404).json({ message: "Cart item not found" });

    if (!cart.pdfUrl) return res.status(400).json({ message: "Cart item missing pdfUrl" });

    // Compose order data for Lulu
    // const orderData = {
    //   contact_email: contact_email || (cart.shipping_address && cart.shipping_address.name) || undefined,
    //   external_id: `cart-${cart._id}`,
    //   quantity: Number(cart.quantity) || 1,
    //   shipping_level: cart.shipping_option || "MAIL",
    //   pod_package_id: cart.pod_package_id,
    //   coverUrl: cart.coverPdfUrl || undefined,
    //   shipping_address: cart.shipping_address,
    //   production_delay: production_delay || 120,
    //   // include the interior file as a line item source_url if the API accepts it
    //   // many Lulu endpoints accept `line_items` or `files`; include a reasonable line_items shape
    //   line_items: [
    //     {
    //       source_url: cart.pdfUrl,
    //       quantity: Number(cart.quantity) || 1,
    //     },
    //   ],
    // };

    cart.shipping_address.name= cart.name;

        const orderData = {
      contact_email:cart.email,
      external_id:`${cart._id}`,
      line_items: [
        {
          external_id: `${cart._id}`,
          printable_normalization: {
            cover: { source_url: cart.coverPdfUrl },    // Use the generated cover URL
            interior: { source_url: cart.pdfUrl },      // Use the generated interior URL
            pod_package_id: cart.pod_package_id,
          },
          quantity: Number(cart.quantity) > 0 ? Number(cart.quantity) : 1,
          title: cart.title || "My Book",
        },
      ],
      production_delay: typeof production_delay === "number" ? production_delay : undefined,
      shipping_address:cart.shipping_address,
      shipping_level:cart.shipping_option || "MAIL",
    };



    // Create print job via Lulu client
    const resp = await createPrintJob(orderData);

    // mark cart as sent
    await Cart.updateOne({ _id: id }, { $set: { status: "sent" } });

    return res.status(200).json({ message: "Print job created", response: { data: resp } });
  } catch (err) {
    console.error("Send cart to print error:", err);
    return res.status(500).json({ message: "Failed to create print job", error: err.message });
  }
};  

module.exports = { createCartItem, getMyCart, sendCartToPrint };

// Create Stripe Checkout session for a cart item
const createCartCheckoutSession = async (req, res) => {
  try {
    const { id: userId, email } = req.decoded;
    const { id } = req.params;
      const getuser = await user.findById(userId);
    const cart = await Cart.findOne({ _id: id, userId }).lean();
    if (!cart) return res.status(404).json({ message: "Cart item not found" });
    const amount = Number(cart.total_price || 0);
    const currency = cart.currency || "USD";
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: getuser.email || email,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: { name: cart.title || `Book ${cart._id}` },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        kind: "cart",
        cartId: cart._id.toString(),
        userId: userId,
      },
      success_url: `${configurations.frontendBaseUrl}/cart?payment=true`,
      cancel_url: `${configurations.frontendBaseUrl}/cart?payment=false`,
    });
    return res.status(200).json({ message: "Checkout session created", response: { data: { id: session.id } }, error: null });
  } catch (err) {
    console.error("Create cart checkout error:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// Helper to send cart to Lulu by ID (used by webhooks)
const sendCartToPrintById = async (userId, cartId, production_delay) => {
  const cart = await Cart.findOne({ _id: cartId, userId }).lean();
  if (!cart) throw new Error("Cart item not found");
  if (!cart.pdfUrl) throw new Error("Cart item missing pdfUrl");

  cart.shipping_address.name = cart.name;

  const orderData = {
    contact_email: cart.email,
    external_id: `${cart._id}`,
    line_items: [
      {
        external_id: `${cart._id}` ,
        printable_normalization: {
          cover: { source_url: cart.coverPdfUrl },
          interior: { source_url: cart.pdfUrl },
          pod_package_id: cart.pod_package_id,
        },
        quantity: Number(cart.quantity) > 0 ? Number(cart.quantity) : 1,
        title: cart.title || "My Book",
      },
    ],
    production_delay: typeof production_delay === "number" ? production_delay : undefined,
    shipping_address: cart.shipping_address,
    shipping_level: cart.shipping_option || "MAIL",
  };

  const resp = await createPrintJob(orderData);
  await Cart.updateOne({ _id: cartId }, { $set: { status: "sent" } });
  return resp;
};



// DELETE /user/cart/:id -> remove a cart item (only when status === 'ready')
const deleteCartItem = async (req, res) => {
  try {
    const { id: userId } = req.decoded;
    const { id } = req.params;

    const cart = await Cart.findOne({ _id: id, userId });
    if (!cart) return res.status(404).json({ message: "Cart item not found" });

    if (cart.status !== "ready") {
      return res.status(400).json({ message: "Only cart items with status 'ready' can be removed", error: "Invalid status" });
    }

    await Cart.deleteOne({ _id: id });

    return res.status(200).json({ message: "Cart item removed" });
  } catch (err) {
    console.error("Delete cart item error:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

module.exports = { createCartItem, getMyCart, sendCartToPrint, deleteCartItem , createCartCheckoutSession, sendCartToPrintById };
