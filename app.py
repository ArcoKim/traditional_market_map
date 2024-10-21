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

@app.route('/position')
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

@app.route('/market')
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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80, debug=True)