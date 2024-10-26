import csv
import random
from datetime import datetime, timedelta
import uuid

# Datos de referencia para Perú
departamentos = [
    "Lima", "Arequipa", "Cusco", "Piura", "La Libertad", "Lambayeque", 
    "Junín", "Áncash", "Ica", "Cajamarca", "Puno", "Tacna", "Loreto",
    "Ucayali", "San Martín", "Huánuco", "Ayacucho", "Apurímac", "Tumbes",
    "Madre de Dios", "Moquegua", "Pasco", "Huancavelica", "Amazonas"
]

categorias = [
    "Electrónica", "Moda", "Hogar", "Deportes", "Juguetes", "Libros",
    "Alimentos", "Bebidas", "Salud y Belleza", "Electrodomésticos",
    "Muebles", "Jardín", "Mascotas", "Automotriz", "Ferretería"
]

productos = {
    "Electrónica": ["Smartphone", "Laptop", "Tablet", "Smart TV", "Audífonos", "Parlante Bluetooth"],
    "Moda": ["Zapatillas", "Jeans", "Polo", "Casaca", "Vestido", "Camisa"],
    "Hogar": ["Juego de sábanas", "Almohadas", "Cortinas", "Alfombra", "Lámpara"],
    "Deportes": ["Pelota de fútbol", "Raqueta", "Mochila deportiva", "Zapatillas running"],
    "Juguetes": ["Muñeca", "Carro control remoto", "Juego de mesa", "Lego"],
    "Libros": ["Novela", "Libro educativo", "Comic", "Libro infantil"],
}

metodos_pago = [
    "Tarjeta de Crédito", "Tarjeta de Débito", "Yape", "Plin",
    "Transferencia Bancaria", "Pago Efectivo", "PayPal"
]

estados_pedido = ["Entregado", "En tránsito", "Procesando", "Cancelado", "Devuelto"]

def generar_precio(categoria):
    rangos_precio = {
        "Electrónica": (199, 5999),
        "Moda": (29, 499),
        "Hogar": (49, 2999),
        "Deportes": (39, 899),
        "Juguetes": (19, 299),
        "Libros": (15, 199),
        "Alimentos": (5, 99),
        "Bebidas": (3, 89),
        "Salud y Belleza": (9, 299),
        "Electrodomésticos": (199, 3999),
        "Muebles": (299, 4999),
        "Jardín": (29, 899),
        "Mascotas": (9, 299),
        "Automotriz": (19, 899),
        "Ferretería": (5, 499)
    }
    min_precio, max_precio = rangos_precio.get(categoria, (10, 1000))
    return round(random.uniform(min_precio, max_precio), 2)

# Generar fechas en el último año
fecha_inicial = datetime.now() - timedelta(days=365)
fecha_final = datetime.now()

# Generar datos
num_registros = 100000  # Genera 100,000 registros
registros = []

for _ in range(num_registros):
    fecha_pedido = fecha_inicial + timedelta(
        seconds=random.randint(0, int((fecha_final - fecha_inicial).total_seconds()))
    )
    
    categoria = random.choice(categorias)
    producto = random.choice(productos.get(categoria, ["Producto Genérico"]))
    cantidad = random.randint(1, 5)
    precio_unitario = generar_precio(categoria)
    subtotal = round(cantidad * precio_unitario, 2)
    igv = round(subtotal * 0.18, 2)
    total = round(subtotal + igv, 2)
    
    registro = {
        'ID_Pedido': str(uuid.uuid4()),
        'Fecha_Pedido': fecha_pedido.strftime('%Y-%m-%d %H:%M:%S'),
        'Departamento': random.choice(departamentos),
        'Categoria': categoria,
        'Producto': producto,
        'Cantidad': cantidad,
        'Precio_Unitario': precio_unitario,
        'Subtotal': subtotal,
        'IGV': igv,
        'Total': total,
        'Metodo_Pago': random.choice(metodos_pago),
        'Estado_Pedido': random.choice(estados_pedido)
    }
    registros.append(registro)

# Ordenar por fecha
registros.sort(key=lambda x: x['Fecha_Pedido'])

# Guardar en CSV
nombre_archivo = 'ventas_ecommerce_peru.csv'
campos = ['ID_Pedido', 'Fecha_Pedido', 'Departamento', 'Categoria', 'Producto', 
          'Cantidad', 'Precio_Unitario', 'Subtotal', 'IGV', 'Total', 
          'Metodo_Pago', 'Estado_Pedido']

with open(nombre_archivo, 'w', newline='', encoding='utf-8') as archivo:
    writer = csv.DictWriter(archivo, fieldnames=campos)
    writer.writeheader()
    writer.writerows(registros)

print(f"Archivo '{nombre_archivo}' generado con {num_registros} registros.")