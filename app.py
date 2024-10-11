import os
from flask import Flask, render_template

app = Flask(__name__)

kakao_api_key = os.environ.get('KAKAO_API_KEY')

@app.route('/')
def index():
    return render_template('index.html', api_key=kakao_api_key)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80, debug=True)