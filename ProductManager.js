import fs from "fs";
import Product from "./Product.js";

class ProductManager {
  #path;
  #idproductos;
  constructor(path) {
    this.#path = path;
    this.#idproductos = 0;
  }

  reset = async () => {
    await fs.promises.writeFile(this.#path, "[]");
  };

  leerArchivo = async () => {
    let productos = [];
    try {
      productos = JSON.parse(await fs.promises.readFile(this.#path, "utf-8"));
    } catch {}
    return productos;
  };

  escribirArchivo = async (productos) => {
    await fs.promises.writeFile(
      this.#path,
      JSON.stringify(productos, null, "\t")
    ); // guarda los productos con formato
  };

  getProducts = async () => {
    try {
      const productos = await JSON.parse(
        await fs.promises.readFile(this.#path, "utf-8")
      );
      return productos;
    } catch {
      return [];
    }
  };

  addProduct = async (producto) => {
    const productos = await this.getProducts();
    const id = this.#addID();
    let productoNuevo = new Product(producto);
    productoNuevo.id = id;
    productos.push(productoNuevo);
    await fs.promises.writeFile(
      this.#path,
      JSON.stringify(productos, null, "\t")
    );
    return console.log("Producto Agregado!");
  };

  #addID = () => {
    this.#idproductos++;
    return this.#idproductos;
  };

  getProductById = async (id) => {
    const productos = await this.getProducts();
    const productoBuscado = productos.find((p) => p.id === id);
    if (productoBuscado !== undefined) {
      return productoBuscado;
    } else {
      throw new Error("No existe producto con ese ID");
    }
  };

  updateProduct = async (id, campo) => {
    this.#validarCampo(campo);
    const productos = await this.getProducts();
    const producto = await this.getProductById(id);
    const index = productos.findIndex((p) => p.id === id);
    if (index != -1) {
      const productoActualizado = { ...productos[index], ...campo };
      const nuevoArray = productos.filter((p) => p.id != producto.id);
      nuevoArray.push(productoActualizado);
      await this.escribirArchivo(nuevoArray);
      return console.log("Producto Modificado!");
    } else {
      throw new Error("No existe producto con ese ID");
    }
  };

  #validarCampo(campo) {
    const camposPermitidos = [
      "title",
      "description",
      "price",
      "thumbnail",
      "code",
      "stock",
    ];

    for (const clave in campo) {
      if (!camposPermitidos.includes(clave)) {
        throw new Error(
          `El campo ${clave} no se puede actualizar o no existe en el producto`
        );
      }
    }
  }

  deleteProduct = async (id) => {
    let productos = await this.getProducts();
    const index = await productos.findIndex((p) => p.id === id);
    if (index != -1) {
      productos = productos.filter((p) => p !== productos[index]);
      await this.escribirArchivo(productos);
      return console.log("Producto Eliminado!");
    } else {
      throw new Error("No existe producto con ese ID");
    }
  };
}

const pm = new ProductManager("./productos.json");

await pm.reset();
await pm.addProduct({
  title: "Remera",
  description: "R talle xl",
  price: 30,
  thumbnail: "url",
  code: "R01",
  stock: 10,
});

await pm.addProduct({
  title: "Short",
  description: "S talle xl",
  price: 15,
  thumbnail: "url",
  code: "S01",
  stock: 11,
});

await pm.addProduct({
  title: "PC",
  description: "Pc de escritorio",
  price: 200,
  thumbnail: "url",
  code: "PC123",
  stock: 13,
});
await pm.deleteProduct(1);

await pm.updateProduct(2, { id: 2000 });

const producto = await pm.getProductById(3);

console.log(producto);
