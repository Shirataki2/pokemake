import sys, codecs
sys.stdout = codecs.getwriter("utf-8")(sys.stdout)
import os
import tensorflow as tf
import numpy as np
import keras
import pickle
from datetime import datetime
from io import BytesIO
from binascii import a2b_base64
from PIL import Image
from flask import Flask, render_template, request, jsonify, make_response
from flask_cors import CORS

APP = Flask(__name__)
CORS(APP)
os.makedirs('archives', exist_ok=True)
model_name = keras.models.load_model('./models/pokeimg2name.h5')
model_type = keras.models.load_model('./models/pokeimg2types.h5')
model_stats = keras.models.load_model('./models/pokeimg2stats.h5')
global graph
graph = tf.get_default_graph()
idx2typ = {0: 'ノーマル',
 1: 'ほのお',
 2: 'みず',
 3: 'でんき',
 4: 'くさ',
 5: 'こおり',
 6: 'かくとう',
 7: 'どく',
 8: 'じめん',
 9: 'ひこう',
 10: 'エスパー',
 11: 'むし',
 12: 'いわ',
 13: 'ゴースト',
 14: 'ドラゴン',
 15: 'あく',
 16: 'はがね',
 17: 'フェアリー'}
idx2chr={0: 'コ',
 1: 'カ',
 2: 'ィ',
 3: 'ヌ',
 4: 'ケ',
 5: 'ミ',
 6: 'ゾ',
 7: 'ゴ',
 8: 'ベ',
 9: 'ト',
 10: 'イ',
 11: 'タ',
 12: 'ダ',
 13: 'ポ',
 14: 'ュ',
 15: 'ッ',
 16: 'マ',
 17: 'ネ',
 18: '♂',
 19: 'サ',
 20: 'ヘ',
 21: 'ル',
 22: 'ジ',
 23: 'セ',
 24: 'ボ',
 25: 'ウ',
 26: 'リ',
 27: 'ロ',
 28: 'ゲ',
 29: 'ビ',
 30: 'ン',
 31: 'Z',
 32: 'ザ',
 33: 'ヒ',
 34: 'ォ',
 35: 'モ',
 36: '2',
 37: 'ェ',
 38: 'ァ',
 39: 'ユ',
 40: 'ナ',
 41: 'プ',
 42: '・',
 43: 'グ',
 44: 'ツ',
 45: 'ョ',
 46: 'ヤ',
 47: 'ゼ',
 48: 'ム',
 49: 'ヨ',
 50: 'ク',
 51: 'ス',
 52: 'ズ',
 53: 'パ',
 54: 'チ',
 55: 'レ',
 56: 'ヴ',
 57: 'メ',
 58: 'ニ',
 59: 'ア',
 60: 'ソ',
 61: 'ャ',
 62: 'デ',
 63: 'ペ',
 64: '♀',
 65: 'オ',
 66: 'シ',
 67: 'ブ',
 68: 'ヂ',
 69: 'フ',
 70: 'キ',
 71: ':',
 72: 'ギ',
 73: 'バ',
 74: 'ノ',
 75: ' ',
 76: 'エ',
 77: 'ー',
 78: 'ピ',
 79: 'ワ',
 80: 'ド',
 81: 'テ',
 82: 'ホ',
 83: 'ガ',
 84: 'ハ',
 85: 'ラ'}


def name_decode(nparr):
    nparr = nparr[0].argmax(axis=1).reshape((6))+1
    ret = ""
    for c in nparr:
        ret += idx2chr[c]
    return ret


def int2types(integer):
    t1 = integer//18
    t2 = integer % 18
    return [idx2typ[int(t1)], idx2typ[int(t2)]]


@APP.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers',
                         'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods',
                         'GET,PUT,POST,DELETE,OPTIONS')
    return response


@APP.route('/')
def index():
    """
    Index Page(./templates/index.html)
    """
    return render_template("index.html")


@APP.route('/run', methods=["POST"])
def run():
    data = str(request.json['img'])
    if data:
        b64_str = data.split(',')[1]
        img = Image.open(BytesIO(a2b_base64(b64_str))).convert('RGB')
        img = img.resize((100, 100))
        img = np.expand_dims(np.asarray(img), axis=0) / 255.
        with graph.as_default():
            pred_name = model_name.predict(img)
            pred_types = model_type.predict(img).argmax(axis=1).reshape((-1))
            pred_stats = model_stats.predict(img)
        name = name_decode(pred_name).replace(" ", "")
        (type1, type2) = int2types(pred_types)
        pred_stats = np.abs(pred_stats*255).reshape((-1)).astype(np.int32)
        return make_response(jsonify({
            "name" : name,
            "type-1":type1,
            "type-2":type2,
            "H":int(pred_stats[0]),
            "A":int(pred_stats[1]),
            "B":int(pred_stats[2]),
            "C":int(pred_stats[3]),
            "D":int(pred_stats[4]),
            "S":int(pred_stats[5]),
        }))


if __name__ == "__main__":
    argv = sys.argv
    argc = len(argv)
    try:
        port = argv[1]
    except IndexError:
        port = 80
    APP.run(debug=True, host="0.0.0.0", port=port)
