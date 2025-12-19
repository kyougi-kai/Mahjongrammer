import sys
import json
import spacy

nlp = spacy.load("en_core_web_sm")

def get_phrase(token):
    return [t.text for t in token.subtree]

def analyze(text):
    doc = nlp(text)

    result = {
        "sentence": None,
        "s": [],
        "v": [],
        "o1": [],
        "o2": [],
        "c": []
    }

    root = None
    for token in doc:
        if token.dep_ == "ROOT" and token.pos_ == "VERB":
            root = token
            break

    if not root:
        return result

    # aux + main verb
    verbs = []
    for child in root.children:
        if child.dep_ == "aux":
            verbs.append(child.text)
    verbs.append(root.text)
    result["v"] = verbs

    for child in root.children:
        if child.dep_ in ("nsubj", "nsubjpass"):
            result["s"] = get_phrase(child)

        elif child.dep_ == "dobj":
            result["o1"] = get_phrase(child)

        elif child.dep_ == "iobj":
            result["o2"] = get_phrase(child)

        elif child.dep_ in ("attr", "oprd", "acomp"):
            result["c"] = get_phrase(child)

    # sentence type
    if result["s"] and not result["o1"] and not result["c"]:
        result["sentence"] = 1
    elif result["s"] and result["c"] and not result["o1"]:
        result["sentence"] = 2
    elif result["s"] and result["o1"] and not result["o2"] and not result["c"]:
        result["sentence"] = 3
    elif result["s"] and result["o1"] and result["o2"]:
        result["sentence"] = 4
    elif result["s"] and result["o1"] and result["c"]:
        result["sentence"] = 5

    return result


if __name__ == "__main__":
    text = sys.argv[1]
    print(json.dumps(analyze(text)))
