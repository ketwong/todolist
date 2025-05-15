from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests

app = Flask(__name__)
CORS(app)

tasks = []
next_id = 1

OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    return jsonify(tasks)

@app.route('/api/tasks', methods=['POST'])
def add_task():
    global next_id
    data = request.get_json()
    task = {'id': next_id, 'title': data.get('title', ''), 'completed': False, 'description': data.get('description', '')}
    tasks.append(task)
    next_id += 1
    return jsonify(task), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.get_json()
    for task in tasks:
        if task['id'] == task_id:
            task['title'] = data.get('title', task['title'])
            task['completed'] = data.get('completed', task['completed'])
            if 'description' in data:
                task['description'] = data['description']
            return jsonify(task)
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    global tasks
    tasks = [task for task in tasks if task['id'] != task_id]
    return '', 204

@app.route('/api/assist', methods=['POST'])
def assist_task():
    data = request.get_json()
    title = data.get('title', '')
    description = data.get('description', '')
    if not title or len(title.split()) < 3:
        return jsonify({
            'type': 'clarification',
            'message': 'Can you provide more details about this task? What is the desired outcome or any specific steps?'
        })
    if not OPENAI_API_KEY:
        return jsonify({'type': 'error', 'message': 'OpenAI API key not set on server.'}), 500
    prompt = f"You are a helpful assistant for a to-do list app. The user has a task: '{title}'. Description: '{description}'. If the information is insufficient, ask for more context. Otherwise, suggest actionable steps to help complete the task. Do not assume missing details."
    try:
        response = requests.post(
            OPENAI_API_URL,
            headers={
                'Authorization': f'Bearer {OPENAI_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'o4-mini-2025-04-16',
                'messages': [
                    {'role': 'system', 'content': 'You are a helpful assistant for a to-do list app.'},
                    {'role': 'user', 'content': prompt}
                ],
                'max_tokens': 200
            },
            timeout=15
        )
        response.raise_for_status()
        ai_message = response.json()['choices'][0]['message']['content']
        return jsonify({'type': 'suggestion', 'message': ai_message})
    except Exception as e:
        return jsonify({'type': 'error', 'message': f'AI request failed: {str(e)}')}), 500

if __name__ == '__main__':
    app.run(debug=True)
