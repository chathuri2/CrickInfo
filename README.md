# CrickInfo

# Sri Lankan Cricket Squad Selector – Machine Learning Mini Project

## Overview

This mini project is a data-driven web application designed to assist in the selection of optimal Sri Lankan cricket squads for various match types using machine learning algorithms. The system enables users to input match-specific conditions (such as format and pitch type) and receive a recommended player squad based on historical performance data and selection logic (e.g. ODI, Test).

This was developed as part of the Machine Learning mini project by team "Algo Rangers"



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
| Frontend     | Next.js        |
| Backend      | Flask / FastAPI             |
| ML Framework | Scikit-learn, XGBoost       |
| Data Tools   | Pandas, BeautifulSoup       |
| Versioning   | Git, GitHub                 |



## System Architecture

<img width="300" alt="System Architecture2" src="https://github.com/user-attachments/assets/d10c3bb5-cf44-44eb-9607-b0231c6e6db4" />



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

- Figma Link of the UI: https://www.figma.com/design/Indh6rpOvF7DEXRFFWieTS/CrickInfo?node-id=0-1&t=9qlf4TnfHY9dubU9-1 


### Use Case Diagram


![use case diagram](https://github.com/user-attachments/assets/6f94abae-f656-4150-a93c-4ae3bf1f6484)



## Installation & Setup

### Prerequisites

- Python 3.8+
- pip

### Clone the Repository
```bash
git clone https://github.com/chathuri2/CrickInfo.git
cd CrickInfo
```

### Create a Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Run the Application 

### Backend (Server)
```bash
cd backend
python app.py
```
### Frontend (Client)
```bash
cd frontend
npm run dev
```


## Team Members

| Student ID    | Name                        |
|---------------|-----------------------------|
| 22ug1-0323    | W.G.K. De Mel               |
| 22ug1-0010    | T.H.R.C. Nirosha            |
| 22ug1-0013    | T.H.R.C. Nadeesha           |
| 22ug1-0082    | H.V. Rahini Nilumika        |
| 22ug1-0233    | T.T. Jayasekara             |
| 22ug1-0460    | A.V.D. Amarathunga          |
| 22ug1-0459    | S.S.D. Fernando             |
| 22ug1-0281    | P.N.M.S.S. Wijesinghe       |
| 22ug1-0471    | K.K.P. Bimsara              |
| 22ug1-0472    | K.G.P. Kavishka             |



