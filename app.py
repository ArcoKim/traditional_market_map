import os
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    api_key = os.environ.get('KAKAO_API_KEY')
    return render_template('index.html', api_key=api_key)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80, debug=True)