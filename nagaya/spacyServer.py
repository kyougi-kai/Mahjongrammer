# spacy_server.py (テスト用: Flask を使った最小サーバー)
from flask import Flask, request, jsonify
import spacy

app = Flask(__name__)
nlp = spacy.load("en_core_web_sm")  # 事前にモデルをダウンロードする必要あり

@app.route('/parse', methods=['POST'])
def parse():
    data = request.get_json(force=True)
    text = data.get('text', '')
    doc = nlp(text)
    tokens = []
    for t in doc:
        tokens.append({
            "text": t.text,
            "whitespace": bool(t.whitespace_),
            "i": t.i,
            "lemma": t.lemma_,
            "pos": t.pos_,
            "tag": t.tag_,
            "dep": t.dep_,
            "ent_iob": t.ent_iob_,
            "ent_type": t.ent_type_
        })
    ents = [{"start": e.start, "end": e.end, "label": e.label_} for e in doc.ents]
    sents = [{"start": s.start, "end": s.end} for s in doc.sents]
    return jsonify({"tokens": tokens, "ents": ents, "sents": sents, "doc": { "is_tagged": True }})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)