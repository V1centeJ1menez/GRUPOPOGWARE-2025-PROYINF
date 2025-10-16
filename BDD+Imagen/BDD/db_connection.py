import psycopg2
from psycopg2 import OperationalError
import os
import sys

# Añadir carpeta raíz al path para poder importar db_config desde cualquier lugar
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from . import db_config

def get_connection():
    try:
        conn = psycopg2.connect(
            host=db_config.HOST,
            database=db_config.DATABASE,
            user=db_config.USER,
            password=db_config.PASSWORD,
            port=db_config.PORT
        )
        return conn
    except OperationalError as e:
        print("❌ Error al conectar a la base de datos:")
        print(e)
        return None
