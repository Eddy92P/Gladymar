import pandas as pd
import requests
import os
from dotenv import load_dotenv
import time

load_dotenv()

USERNAME = os.getenv('IMPORT_USERNAME')
PASSWORD = os.getenv('IMPORT_PASSWORD')
LOGIN_URL = f"{os.getenv('BASE_URL')}/api/user/login/"
REFRESH_URL = f"{os.getenv('BASE_URL')}/api/user/refresh/"
WAREHOUSE_URL = f"{os.getenv('BASE_URL')}/api/sale/warehouses/"
EXCEL_PATH = 'sale/import_files/warehouse.xlsx'


def get_auth_session():
    session = requests.Session()
    response = session.post(
        LOGIN_URL, json={'email': USERNAME, 'password': PASSWORD}
    )
    response.raise_for_status()
    if not session.cookies.get('access'):
        raise RuntimeError(
            'Login succeeded but no access token cookie was returned'
        )
    return session


def refresh_auth_session(session):
    response = session.post(REFRESH_URL)
    response.raise_for_status()


df = pd.read_excel(EXCEL_PATH)

session = get_auth_session()

success_count = 0
failed = []

for index, row in df.iterrows():
    payload = {
        'name': str(row['NOMBRE']),
        'location': str(row['UBICACION']),
        'agency_id': int(row['ID_AGENCIA']),
    }

    response = session.post(WAREHOUSE_URL, json=payload)

    if response.status_code == 401:
        refresh_auth_session(session)
        response = session.post(WAREHOUSE_URL, json=payload)

    if response.status_code == 201:
        success_count += 1
    else:
        failed.append({
            'row': index,
            'payload': payload,
            'status': response.status_code,
            'error': response.text,
        })
        print(f"Row {index} failed: {response.status_code} - {response.text}")

    time.sleep(0.05)

print(f"\n✅ Registros creados: {success_count}")
print(f"❌ Registros fallidos: {len(failed)}")

if failed:
    pd.DataFrame(failed).to_csv('failed_warehouses.csv', index=False)
    print(
        "\n❌ Detalles de los registros fallidos han sido guardados "
        "en failed_warehouses.csv"
    )
