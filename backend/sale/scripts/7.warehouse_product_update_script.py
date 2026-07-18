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
EXCEL_PATH = 'sale/import_files/warehouse_products.xlsx'


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

# Group rows by warehouse so each PATCH contains all products for that warehouse.
# Sum stock when the same product appears more than once (unique per warehouse).
for warehouse_id, group in df.groupby('ID_ALMACEN'):
    aggregated = (
        group.groupby('ID_PRODUCTO', as_index=False)['STOCK'].sum()
    )
    product_stock = [
        {
            'product': int(row['ID_PRODUCTO']),
            'stock': float(row['STOCK']),
        }
        for _, row in aggregated.iterrows()
    ]

    payload = {'product_stock': product_stock}

    url = f"{WAREHOUSE_URL}{int(warehouse_id)}/"
    response = session.patch(url, json=payload)

    if response.status_code == 401:
        refresh_auth_session(session)
        response = session.patch(url, json=payload)

    if response.status_code == 200:
        success_count += 1
    else:
        failed.append({
            'warehouse_id': warehouse_id,
            'payload': payload,
            'status': response.status_code,
            'error': response.text,
        })
        print(
            f"Warehouse {warehouse_id} failed: "
            f"{response.status_code} - {response.text}"
        )

    time.sleep(0.05)

print(f"\n✅ Almacenes actualizados: {success_count}")
print(f"❌ Almacenes fallidos: {len(failed)}")

if failed:
    pd.DataFrame(failed).to_csv('failed_warehouse_updates.csv', index=False)
    print(
        "\n❌ Detalles de los registros fallidos han sido guardados "
        "en failed_warehouse_updates.csv"
    )
