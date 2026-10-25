# MediMind AI

MediMind AI is an educational symptom-checking chatbot built with Flask, React, and machine-learning models. Users can enter symptoms, review recognized symptoms, and receive a model-generated possible-condition prediction with related descriptions and precautions.

> **Medical disclaimer:** MediMind AI is an experimental educational project, not a medical device. Its predictions may be inaccurate and must not be used for self-diagnosis, treatment, or medical decisions. Always consult a qualified healthcare professional.

## Features

- Symptom input through a chat interface
- Flask API for symptom processing and prediction
- Saved PyTorch and scikit-learn models
- Condition descriptions and precaution information
- Separate conversation IDs for new chats
- React-based responsive frontend

## Tech Stack

**Backend**
- Python 3.11.9
- Flask
- PyTorch
- NLTK
- NumPy and Pandas
- scikit-learn

**Frontend**
- React
- Vite
- Tailwind CSS
- Lucide React

## Project Structure

```text
MediMind-AI/
├── app.py
├── nnet.py
├── nltk_utils.py
├── requirements.txt
├── Meddy.ipynb
├── intents.json
├── intents_short.json
├── data/
├── models/
├── static/
├── templates/
└── frontend/
    ├── src/
    ├── package.json
    └── vite.config.js
```

## Prerequisites

- Python 3.11.9 recommended
- Node.js and npm
- Git (for cloning the repository)

## Installation

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd MediMind-AI
```

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with the repository URL after creating it on GitHub.

### 2. Create the Python environment

On Windows PowerShell:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

If PowerShell blocks environment activation, use the virtual environment's Python executable directly.

### 3. Download NLTK resources

```powershell
python -c "import nltk; nltk.download('punkt'); nltk.download('punkt_tab')"
```

### 4. Install frontend dependencies

```powershell
cd frontend
npm install
cd ..
```

## Run the Application Locally

Start the backend and frontend in two separate terminals.

### Terminal 1: Flask backend

Run from the repository root:

```powershell
.\.venv\Scripts\python.exe -m flask --app app run --host 127.0.0.1 --port 5000
```

The backend will be available at `http://127.0.0.1:5000`.

### Terminal 2: React frontend

```powershell
cd frontend
npm run dev
```

Open the local URL printed by Vite in the terminal. The Vite development proxy forwards frontend `/api` requests to the Flask backend.

## Required Model and Data Files

The backend expects these files at the specified paths:

- `models/data.pth`
- `models/fitted_model.pickle2`
- `data/list_of_symptoms.pickle`
- `data/symptom_Description.csv`
- `data/symptom_precaution.csv`
- `data/Symptom-severity.csv`
- `static/assets/files/ds_symptoms.txt`

Keep these paths and filenames unchanged unless the application code is updated accordingly.

## Training

`Meddy.ipynb` contains the model-training workflow. Reproducing training requires the training dataset at `data/dataset.csv`, which is not included in this repository.

The saved model files are intended for running the application; model training is not required for normal local use.

## Development Checks

The following checks were run during development:

- Frontend production build
- Frontend ESLint check
- Flask backend startup and homepage response
- Basic symptom API interaction and prediction flow

These checks establish basic application functionality, not clinical validity or prediction accuracy.

## Limitations and Safety

- Predictions may be incorrect or misleading.
- A model-generated condition is not a confirmed diagnosis.
- Do not use this project to make healthcare or treatment decisions.
- The Flask development server is for local development only. Public deployment requires a properly configured production server, secure API configuration, and additional testing.

## License

See the `LICENSE` file for license information.
