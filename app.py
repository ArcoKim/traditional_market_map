import os
import pymysql
import pymysql.cursors
from flask import Flask, render_template

app = Flask(__name__)

kakao_api_key = os.environ.get('KAKAO_API_KEY')

def get_connection():
    return pymysql.connect(
        host=os.environ.get('DB_HOST'),
        user=os.environ.get('DB_USER'),
        password=os.environ.get('DB_PASSWORD'),
        database=os.environ.get('DB_DATABASE'),
        cursorclass=pymysql.cursors.DictCursor
    )

@app.route('/')
def index():
    return render_template('index.html', api_key=kakao_api_key)

@app.route('/position')
def position():
    conn = get_connection()
    ret = []

    try:
        with conn.cursor() as cursor:
            sql = "SELECT name, latitude, longitude FROM market"
            cursor.execute(sql)

            results = cursor.fetchall()
            for row in results:
                ret.append(row)
    finally:
        conn.close()

    return ret

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80, debug=True)