from PIL import Image, ImageDraw, ImageFont
import io
import os

def generar_imagen(cliente_nombre, monto, template_path=r".\Imagen_fondo.jpg", output_file=None):

    if template_path is None:
        template_path = os.path.join(os.path.dirname(__file__), "Imagen_fondo.jpg")
    else:
        template_path = os.path.abspath(template_path)


    # Abrir imagen base
    img = Image.open(template_path).convert("RGBA")
    draw = ImageDraw.Draw(img)

    # Fuente para escribir texto
    font_path = r"C:\Windows\Fonts\georgiab.ttf"  # Tipo letra
    font_nombre = ImageFont.truetype(font_path, 50)
    font_texto = ImageFont.truetype(font_path, 50)
    font_monto = ImageFont.truetype(font_path, 100)  # Más grande para el monto

    # Posiciones del texto
    nombre_pos = (400, 150)
    texto_pos = (150, 200)
    monto_pos = (250, 400)

    # Escribir nombre
    draw.text(nombre_pos, f"¡Hola, {cliente_nombre}!", font=font_nombre, fill=(0,0,0,255))

    # Escribir texto
    draw.text(texto_pos, f"Tienes un credito preaprobado por:", font=font_texto, fill=(0,0,0,255))

    # Escribir monto
    monto_texto = "${:,.0f}".format(monto)
    draw.text(monto_pos, monto_texto, font=font_monto, fill=(0,0,0,255))

    # Guardar en memoria
    b = io.BytesIO()
    img.convert("RGB").save(b, format="JPEG", quality=90)
    b.seek(0)

    # Guardar en archivo si se proporciona nombre
    if output_file:
        with open(output_file, "wb") as f:
            f.write(b.read())
        print(f"Imagen guardada en {output_file}")

    return b