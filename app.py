from flask import Flask, render_template, request, jsonify
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from datetime import datetime

app = Flask(__name__)

data = pd.read_csv('all_month.csv')

data.dropna(subset=['mag'], inplace=True)

X = data[['latitude', 'longitude', 'time']].copy()
y = data['mag'].values

X['time'] = X['time'].apply(lambda t: datetime.fromisoformat(t[:-1]).timestamp())

model = LinearRegression()
model.fit(X, y)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    latitude = float(request.form['latitude'])
    longitude = float(request.form['longitude'])
    user_input_date = request.form['date']

    input_time = datetime.strptime(user_input_date, '%Y-%m-%d')

    timestamp = (input_time - datetime(1970, 1, 1)).total_seconds()

    input_data = np.array([[latitude, longitude, timestamp]])
    predicted_magnitude = model.predict(input_data)

    return jsonify({'magnitude': predicted_magnitude[0]})

if __name__ == '_main_':
    app.run(debug=True)