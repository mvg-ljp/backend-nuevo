import express from "express";
const router = express.Router();
import CartManager from "../dao/db/cart-manager-db.js";
const cartManager = new CartManager();
import CartModel from "../dao/models/cart.model.js";


// DELETE api/carts/:cid/products/:pid
router.delete('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;

    try {
        const cart = await cartManager.getCarritoById(cid);
        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        cart.products = cart.products.filter(item => item.product.toString() !== pid);
        await cart.save();

        res.status(200).json({ message: "Producto eliminado del carrito", cart });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el producto del carrito", error });
    }
});

// PUT api/carts/:cid
router.put('/:cid', async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body;

    try {
        const cart = await cartManager.getCarritoById(cid);
        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        cart.products = products; // Aquí se asume que products es un array de { product, quantity }
        await cart.save();

        res.status(200).json({ message: "Carrito actualizado", cart });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el carrito", error });
    }
});

// PUT api/carts/:cid/products/:pid
router.put('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    try {
        const cart = await cartManager.getCarritoById(cid);
        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        const productInCart = cart.products.find(item => item.product.toString() === pid);
        if (!productInCart) {
            return res.status(404).json({ message: "Producto no encontrado en el carrito" });
        }

        productInCart.quantity = quantity;
        await cart.save();

        res.status(200).json({ message: "Cantidad de producto actualizada", cart });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la cantidad del producto", error });
    }
});

// DELETE api/carts/:cid
router.delete('/:cid', async (req, res) => {
    const { cid } = req.params;

    try {
        const cart = await cartManager.getCarritoById(cid);
        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        cart.products = []; // Elimina todos los productos del carrito
        await cart.save();

        res.status(200).json({ message: "Todos los productos han sido eliminados del carrito", cart });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar los productos del carrito", error });
    }
});

// GET api/carts/:cid (con populate)
router.get('/:cid', async (req, res) => {
    const { cid } = req.params;

    try {
        const cart = await CartModel.findById(cid).populate('products.product');
        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el carrito", error });
    }
});




//1) Creamos un nuevo carrito: 

router.post("/", async (req, res) => {
    try {
        const nuevoCarrito = await cartManager.crearCarrito();
        res.json(nuevoCarrito);
    } catch (error) {
        console.error("Error al crear un nuevo carrito", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

//2) Listamos los productos que pertenecen a determinado carrito. 

router.get("/:cid", async (req, res) => {
    const cartId = req.params.cid;

    try {
        const carrito = await CartModel.findById(cartId)
            
        if (!carrito) {
            console.log("No existe ese carrito con el id");
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        return res.json(carrito.products);
    } catch (error) {
        console.error("Error al obtener el carrito", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

//3) Agregar productos a distintos carritos.

router.post("/:cid/product/:pid", async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity || 1;

    try {
        const actualizarCarrito = await cartManager.agregarProductoAlCarrito(cartId, productId, quantity);
        res.json(actualizarCarrito.products);
    } catch (error) {
        console.error("Error al agregar producto al carrito", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});



export default router;