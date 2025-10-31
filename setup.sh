#!/bin/bash
pip install -r requirements.txt
python db/setup_db.py
cd frontend && npm install
cd ..
