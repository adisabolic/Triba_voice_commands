import numpy as np
from flask import Flask, request, jsonify, render_template
from ML import predict_class
import requests

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    filename = request.form['audio_filename']
    path = "C:/Users/Adisa/Downloads/" + filename
    predictions = predict_class([path])
    return {"predictions": predictions}
if __name__ == "__main__":
    app.run(debug=True)