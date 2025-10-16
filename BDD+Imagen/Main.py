from BDD.db_connection import get_connection
from CREADOR_IMAGEN.Imagen import generar_imagen
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
import smtplib


# --- Función para enviar correo ---
def enviar_correo(destinatario, nombre, monto, imagen_path):
    remitente = "usm.pogware.03@gmail.com"
    password = "wzxbarbblpbwgymr"

    asunto = "Tu crédito preaprobado está listo 🎉"
    cuerpo = f"""
    <h2>¡Hola {nombre}!</h2>
    <p>Tienes un crédito de consumo preaprobado por <b>${monto:,.0f}</b>.</p>
    <p>Atentamente,<br><b>Pogware</b></p>
    """

    # Crear mensaje
    msg = MIMEMultipart()
    msg["From"] = remitente
    msg["To"] = destinatario
    msg["Subject"] = asunto
    msg.attach(MIMEText(cuerpo, "html"))

    # Adjuntar imagen
    with open(imagen_path, "rb") as f:
        img_data = f.read()
    image = MIMEImage(img_data, name="preaprobado.jpg")
    msg.attach(image)

    # Conectar y enviar
    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as servidor:
            servidor.starttls()
            servidor.login(remitente, password)
            servidor.send_message(msg)
        print(f"✅ Correo enviado correctamente a {destinatario}")
    except Exception as e:
        print(f"❌ Error al enviar correo: {e}")



# --- Obtener un cliente de la base ---
def obtener_un_cliente():
    conn = get_connection()
    if not conn:
        return None
    try:
        cur = conn.cursor()
        cur.execute("SELECT nombre_completo, correo FROM cliente LIMIT 1;")
        cliente = cur.fetchone()  # retorna (nombre, correo)
        return cliente
    finally:
        cur.close()
        conn.close()


# --- PRUEBA ---
if __name__ == "__main__":
    cliente = obtener_un_cliente()
    if cliente:
        nombre, correo = cliente
        monto = 5000000  # monto genérico para prueba
        imagen_generada = "preaprobado_prueba.jpg"

        # Generar imagen de prueba
        generar_imagen(nombre, monto, output_file=imagen_generada)

        # Enviar correo con la imagen
        enviar_correo(correo, nombre, monto, imagen_generada)
    else:
        print("❌ No se encontró ningún cliente en la base de datos.")