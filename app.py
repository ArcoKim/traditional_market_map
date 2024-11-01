import os
import sqlite3
from flask import Flask, render_template, request

app = Flask(__name__)

kakao_api_key = os.environ.get('KAKAO_API_KEY')

def get_connection():
    conn = sqlite3.connect('data/tmmap.db')
    conn.row_factory = sqlite3.Row
    return conn
    
@app.route('/')
def index():
    return render_template('index.html', api_key=kakao_api_key)

@app.route('/position', methods=['GET'])
def position():
    conn = get_connection()
    ret = []

    try:
        cur = conn.cursor()
        cur.execute("SELECT name, latitude, longitude FROM market")

        results = cur.fetchall()
        for row in results:
            ret.append(dict(row))
    finally:
        conn.close()

    return ret

@app.route('/market', methods=['GET'])
def market():
    latitude = request.args.get('latitude')
    longitude = request.args.get('longitude')

    conn = get_connection()

    try:
        cur = conn.cursor()
        cur.execute("""
        SELECT category, address, open_cycle, number_of_stores, items_type, homepage, open_year, phone_number, restroom, arcade, elevator, support_center, 
        sprinkler, fire_detector, play_room, call_center, foyer, lactation_center, stockroom, bicycle_rack, gym, library, shopping_cart, visitor_center, 
        movement_path, broadcasting_center, cultural_center, cooperative_warehouse, parking, education_center, meeting_room, AED
        FROM market, facility
        WHERE market.facility_id = facility.id
        AND market.latitude = ? AND market.longitude = ?
        """, (latitude, longitude))

        ret = cur.fetchone()
    finally:
        conn.close()

    return dict(ret)

@app.route('/search', methods=['POST'])
def search():
    form = request.form
    param = []
    sql = "SELECT name, address, latitude, longitude"

    current_lat = form.get("latitude")
    current_lon = form.get("longitude")
    if current_lat and current_lon:
        sql += """, (6371 * acos(
            cos(radians(?)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians(?)) +
            sin(radians(?)) * sin(radians(latitude))
        )) AS distance"""
        param.extend([current_lat, current_lon, current_lat])
    sql += " FROM market, facility WHERE market.facility_id = facility.id"

    for key in form.keys():
        value = form.getlist(key)
        if key in ["latitude", "longitude", "etc"]:
            continue
        elif key == "name" and value[0]:
            sql += f" AND name LIKE ?"
            param.append(f"%{value[0]}%")
        elif key in ["category", "open_cycle", "items_type"]:
            if len(value) > 1:
                sql += f" AND {key} IN ({','.join(['?'] * len(value))})"
            else:
                sql += f" AND {key} = ?"
            param.extend(value)
        elif value[0] == "true":
            sql += f" AND {key} = 1"
        elif value[0] == "false":
            sql += f" AND {key} = 0"

    if current_lat and current_lon:
        sql += " ORDER BY distance"
    sql += " LIMIT 10"

    conn = get_connection()
    ret = []
    try:
        cur = conn.cursor()
        cur.execute(sql, param)
        results = cur.fetchall()
        for row in results:
            ret.append(dict(row))
    finally:
        conn.close()

    return ret

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80, debug=True)