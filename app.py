import json
import torch
import nltk
import pickle
import random
from datetime import datetime
import numpy as np
import pandas as pd

from nnet import NeuralNet
from nltk_utils import bag_of_words
from flask import Flask, render_template, url_for, request, jsonify
from flask_cors import CORS
import os

random.seed(datetime.now().timestamp())

device = torch.device('cpu')
FILE = "models/data.pth"
model_data = torch.load(FILE)

input_size = model_data['input_size']
hidden_size = model_data['hidden_size']
output_size = model_data['output_size']
all_words = model_data['all_words']
tags = model_data['tags']
model_state = model_data['model_state']

nlp_model = NeuralNet(input_size, hidden_size, output_size).to(device)
nlp_model.load_state_dict(model_state)
nlp_model.eval()

diseases_description = pd.read_csv("data/symptom_Description.csv")
diseases_description['Disease'] = diseases_description['Disease'].apply(lambda x: x.lower().strip(" "))

disease_precaution = pd.read_csv("data/symptom_precaution.csv")
disease_precaution['Disease'] = disease_precaution['Disease'].apply(lambda x: x.lower().strip(" "))

symptom_severity = pd.read_csv("data/Symptom-severity.csv")
symptom_severity = symptom_severity.map(lambda s: s.lower().strip(" ").replace(" ", "") if type(s) == str else s)


with open('data/list_of_symptoms.pickle', 'rb') as data_file:
    symptoms_list = pickle.load(data_file)

with open('models/fitted_model.pickle2', 'rb') as modelFile:
    prediction_model = pickle.load(modelFile)

conversation_symptoms = {}
conversation_symptom_history = {}

app = Flask(__name__)
allowed_origins = os.environ.get('FRONTEND_ORIGIN', 'http://localhost:5173').split(',')
CORS(app, resources={r'/symptom': {'origins': [origin.strip() for origin in allowed_origins if origin.strip()]}})

def get_symptom(sentence):
    sentence = nltk.word_tokenize(sentence)
    X = bag_of_words(sentence, all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X)

    output = nlp_model(X)
    _, predicted = torch.max(output, dim=1)
    tag = tags[predicted.item()]

    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]
    prob = prob.item()

    return tag, prob

@app.route('/')
def index():
    data = []
    file = open("static/assets/files/ds_symptoms.txt", "r")
    all_symptoms = file.readlines()
    for s in all_symptoms:
        data.append(s.replace("'", "").replace("_", " ").replace(",\n", ""))
    data = json.dumps(data)

    return render_template('index.html', data=data)


@app.route('/symptom', methods=['GET', 'POST'])
def predict_symptom():
    payload = request.get_json(silent=True) or {}
    sentence = str(payload.get("sentence", "")).strip()
    conversation_id = str(payload.get("conversation_id") or "legacy")[:100]

    if not sentence:
        return jsonify("Please enter a symptom or message."), 400

    user_symptoms = conversation_symptoms.setdefault(conversation_id, set())
    display_symptoms = conversation_symptom_history.setdefault(conversation_id, set())
    if sentence.replace(".", "").replace("!","").lower().strip() == "done":

        if not user_symptoms:
            response_sentence = random.choice(
                ["I can't know what disease you may have if you don't enter any symptoms :)",
                "Meddy can't know the disease if there are no symptoms...",
                "You first have to enter some symptoms!"])
        else:
            x_test = []

            for each in symptoms_list:
                if each in user_symptoms:
                    x_test.append(1)
                else:
                    x_test.append(0)

            x_test = np.asarray(x_test)
            disease = prediction_model.predict(x_test.reshape(1,-1))[0]
            print(disease)

            description = diseases_description.loc[diseases_description['Disease'] == disease.strip(" ").lower(), 'Description'].iloc[0]
            precaution = disease_precaution[disease_precaution['Disease'] == disease.strip(" ").lower()]
            precautions = 'Precautions: ' + precaution.Precaution_1.iloc[0] + ", " + precaution.Precaution_2.iloc[0] + ", " + precaution.Precaution_3.iloc[0] + ", " + precaution.Precaution_4.iloc[0]
            response_sentence = ("Based on the symptoms entered, the model suggests " + disease + ". This is not a confirmed diagnosis. Description: " + str(description) + ". " + precautions)

            severity = []

            for each in user_symptoms:
                severity.append(symptom_severity.loc[symptom_severity['Symptom'] == each.lower().strip(" ").replace(" ", ""), 'weight'].iloc[0])

            if np.mean(severity) > 4 or np.max(severity) > 5:
                response_sentence = response_sentence + " Because symptom severity can be important, consult a qualified healthcare professional if symptoms are severe or worsening."

            user_symptoms.clear()
            severity.clear()

    else:
        symptom, prob = get_symptom(sentence)
        print("Symptom:", symptom, ", prob:", prob)
        if prob > .5:
            response_sentence = "I noted " + symptom.replace("_", " ") + ". You can add another symptom, or type Done to see the model's possible-condition prediction."
            user_symptoms.add(symptom)
            display_symptoms.add(symptom)
        else:
            response_sentence = "I'm sorry, but I don't understand you."

        print("User symptoms:", user_symptoms)

    return jsonify({
        "reply": response_sentence.replace("_", " "),
        "symptoms": sorted(s.replace("_", " ") for s in display_symptoms),
    })
