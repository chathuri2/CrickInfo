# CrickInfo

# Sri Lankan Cricket Squad Selector – Machine Learning Mini Project

## Overview

This mini project is a data-driven web application designed to assist in the selection of optimal Sri Lankan cricket squads for various match types using machine learning algorithms. The system enables users to input match-specific conditions (such as format and pitch type) and receive a recommended player squad based on historical performance data and selection logic (e.g. ODI, Test).

This was developed as part of the Machine Learning mini project by team "Algo Rangers".



## Project Objectives

- To apply machine learning techniques for automated squad selection based on data.
- To implement an end-to-end system integrating data processing, model inference, and user interaction.
- To build a user-friendly interface to interact with the selection system.
- To ensure reproducibility and maintainability through proper documentation and modular code.



## System Features

- Interactive web interface for inputting match-specific parameters.
- Automated squad prediction using trained ML models.
- Display of detailed statistics for each selected player.
- RESTful API endpoints for backend access.
- Scalable structure for adding more features or extending data inputs.



## Technology Stack

| Layer        | Tools/Frameworks            |
|--------------|-----------------------------|
| Frontend     | Streamlit (or React)        |
| Backend      | Flask / FastAPI             |
| ML Framework | Scikit-learn, XGBoost       |
| Data Tools   | Pandas, BeautifulSoup       |
| Versioning   | Git, GitHub                 |



## System Architecture

<img width="2823" height="3840" alt="System Architecture" src="https://github.com/user-attachments/assets/fbcb2422-4a23-443a-ab81-3a834d5a40a4" />





## Machine Learning Overview

- **Input Parameters**: Match type (ODI/T20), pitch condition, venue.
- **Target**: Squad selection with appropriate player roles and form.
- **Features Used**: Batting average, strike rate, bowling economy, recent match stats, role (batsman, bowler, all-rounder).
- **Algorithms**: Random Forest, XGBoost.
- **Output**: A list of selected players based on optimized team composition.
- **Model Evaluation**: Accuracy, Precision, Recall.
- **Model Storage**: Serialized using Pickle or Joblib.



## User Interface & Wireframes

The UI is designed for simplicity and clarity. It includes:

- A form for inputting match type and conditions.
- A result page displaying selected players and key statistics.

### Wireframe




## Use Case Diagram





## Installation & Setup

### Prerequisites

- Python 3.8+
- pip

### Clone the Repository

git clone https://github.com/chathuri2/CrickInfo.git
cd CrickInfo

### Create a Virtual Environment

python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

### Install Dependencies

pip install -r requirements.txt

### Run the Application 

### Backend (Flask)

cd backend
python app.py

### Frontend (Streamlit)

cd frontend
streamlit run app.py



## Team Members


