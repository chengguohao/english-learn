"""Convert pets3_words.json -> compact JS data file for inlining into the app bundle."""
import json, io

with io.open('wordlists/pets3_words.json', encoding='utf-8') as f:
    words = json.load(f)

# Compact representation:
# Array of arrays: [word, us_phonetic, [definitions...], [sentences [[en,cn]...]]]
# Omit empty fields to save space.
out = []
for w in words:
    entry = [w['w']]
    if w.get('ph'):
        entry.append(w['ph'])
    if w.get('def'):
        entry.append(w['def'])
    if w.get('sent'):
        entry.append([[s['en'], s['cn']] for s in w['sent']])
    out.append(entry)

js = 'window.__WORDS__=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';'
with io.open('pets3-app/src/words-data.js', 'w', encoding='utf-8') as f:
    f.write(js)

print('entries:', len(out))
print('js size: %.2f MB' % (len(js.encode('utf-8')) / 1024 / 1024))
