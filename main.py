from flask import Flask, render_template, url_for, send_from_directory


app = Flask(__name__)

@app.route('/')
def display():
    return render_template('index.html')

@app.route('/data')
def send_data():
    return send_from_directory('.', 'data.json')

if __name__ == '__main__':
    app.run()