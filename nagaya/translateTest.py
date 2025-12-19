from lxml import etree
from argostranslate import translate
from pathlib import Path
import re

IN_XML = Path("../LanguageTool/org/languagetool/rules/en/grammar.xml")
OUT_XML = Path("grammar_ja.xml")

GRAMMAR_DICT = {
  "noun": "名詞",
  "verb": "動詞",
  "adjective": "形容詞",
  "adverb": "副詞",
  "pronoun": "代名詞",
  "article": "冠詞",
  "definite article": "定冠詞",
  "indefinite article": "不定冠詞",
  "determiner": "限定詞",
  "preposition": "前置詞",
  "conjunction": "接続詞",
  "auxiliary verb": "助動詞",
  "modal verb": "法助動詞",
  "infinitive": "不定詞",
  "gerund": "動名詞",
  "participle": "分詞",
  "present participle": "現在分詞",
  "past participle": "過去分詞",
  "tense": "時制",
  "aspect": "アスペクト",
  "voice": "態",
  "active voice": "能動態",
  "passive voice": "受動態",
  "subject": "主語",
  "predicate": "述語",
  "object": "目的語",
  "direct object": "直接目的語",
  "indirect object": "間接目的語",
  "complement": "補語",
  "clause": "節",
  "main clause": "主節",
  "subordinate clause": "従属節",
  "relative clause": "関係節",
  "conditional": "条件法 / 条件節",
  "imperative": "命令文",
  "interrogative": "疑問文",
  "negation": "否定",
  "modifier": "修飾語",
  "phrase": "句",
  "countable noun": "可算名詞",
  "uncountable noun": "不可算名詞",
  "collective noun": "集合名詞",
  "possessive": "所有格",
  "reflexive pronoun": "再帰代名詞",
  "demonstrative": "指示詞",
  "comparative": "比較級",
  "superlative": "最上級",
  "phrasal verb": "句動詞",
  "collocation": "コロケーション",
  "transitive verb": "他動詞",
  "intransitive verb": "自動詞",
  "reported speech": "間接話法",
  "subject-verb agreement": "主語と動詞の一致",
  "punctuation": "句読点",
  "comma": "コンマ",
  "semicolon": "セミコロン",
  "colon": "コロン",
  "apostrophe": "アポストロフィ",
  "quotation marks": "引用符",
  "nouns": "名詞",
  "verbs": "動詞",
  "adjectives": "形容詞",
  "adverbs": "副詞",
  "pronouns": "代名詞",
  "articles": "冠詞",
  "definite articles": "定冠詞",
  "indefinite articles": "不定冠詞",
  "determiners": "限定詞",
  "prepositions": "前置詞",
  "conjunctions": "接続詞",
  "auxiliary verbs": "助動詞",
  "modal verbs": "法助動詞",
  "infinitives": "不定詞",
  "gerunds": "動名詞",
  "participles": "分詞",
  "present participles": "現在分詞",
  "past participles": "過去分詞",
  "tenses": "時制",
  "aspects": "アスペクト",
  "voices": "態",
  "active voices": "能動態",
  "passive voices": "受動態",
  "subjects": "主語",
  "predicates": "述語",
  "objects": "目的語",
  "direct objects": "直接目的語",
  "indirect objects": "間接目的語",
  "complements": "補語",
  "clauses": "節",
  "main clauses": "主節",
  "subordinate clauses": "従属節",
  "relative clauses": "関係節",
  "conditionals": "条件法 / 条件節",
  "imperatives": "命令文",
  "interrogatives": "疑問文",
  "negations": "否定",
  "modifiers": "修飾語",
  "phrases": "句",
  "countable nouns": "可算名詞",
  "uncountable nouns": "不可算名詞",
  "collective nouns": "集合名詞",
  "possessives": "所有格",
  "reflexive pronouns": "再帰代名詞",
  "demonstratives": "指示詞",
  "comparatives": "比較級",
  "superlatives": "最上級",
  "phrasal verbs": "句動詞",
  "collocations": "コロケーション",
  "transitive verbs": "他動詞",
  "intransitive verbs": "自動詞",
  "reported speeches": "間接話法",
  "subject-verb agreements": "主語と動詞の一致",
  "punctuations": "句読点",
  "commas": "コンマ",
  "semicolons": "セミコロン",
  "colons": "コロン",
  "apostrophes": "アポストロフィ",
}

def apply_grammar_dict(text: str) -> str:
    for en, ja in GRAMMAR_DICT.items():
        text = text.replace(en, ja)
    return text

def translate_text(text: str) -> str:
    ja = translate.translate(text, "en", "ja")
    return apply_grammar_dict(ja)

parser = etree.XMLParser(remove_blank_text=False)
tree = etree.parse(str(IN_XML), parser)
root = tree.getroot()

count = 0

for msg in root.findall(".//message"):
    # ① <message>直下のテキスト
    if msg.text and msg.text.strip():
        msg.text = translate_text(msg.text)

    # ② 子要素（<suggestion>など）
    for child in msg:
        # child.text は翻訳しない！
        # child.tail は翻訳する
        if child.tail and child.tail.strip():
            child.tail = translate_text(child.tail)

    count += 1

tree.write(
    str(OUT_XML),
    encoding="utf-8",
    xml_declaration=True,
    pretty_print=True
)

print(f"Translated {count} <message> elements")
print(f"Output → {OUT_XML}")