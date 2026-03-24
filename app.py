import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

# 1. Initialisation de l'application Flask
app = Flask(__name__)
CORS(app)  # Permet à ton index.html de communiquer avec ce serveur

# 2. Configuration de l'IA Gemini
# La clé API doit être définie dans les variables d'environnement de Cloud Run
API_KEY = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

def load_system_prompt():
    """Lit les instructions personnalisées basées sur ton CV"""
    try:
        with open('system_prompt.txt', 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        # Message de secours si le fichier est absent
        return "Tu es l'assistant de Jed Aloui, un élève passionné de tech."

@app.route('/ask', methods=['POST'])
def ask():
    """Point d'entrée pour les questions du terminal"""
    data = request.json
    user_message = data.get("message", "")

    if not user_message:
        return jsonify({"reply": "Commande vide reçue."}), 400

    # Préparation du contexte complet (Instructions + Question)
    system_context = load_system_prompt()
    full_prompt = f"{system_context}\n\nUtilisateur: {user_message}\nAssistant Neurolis:"

    try:
        # Génération de la réponse par l'IA
        response = model.generate_content(full_prompt)
        return jsonify({"reply": response.text})
    except Exception as e:
        print(f"Erreur système : {e}")
        return jsonify({"reply": "Désolé, ma connexion au Nexus est instable."}), 500

# 3. Lancement du serveur
if __name__ == "__main__":
    # Cloud Run définit automatiquement la variable PORT
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
