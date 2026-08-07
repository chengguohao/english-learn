"""Merge kajweb CET4 x3 -> PETS3 wordlist (dedup, normalize, save compact json).
Inputs: wordlists/kajweb_cet4/{CET4_1,CET4_2,CET4_3}.json (concatenated JSON objects)
Output: wordlists/pets3_words.json (single JSON array of normalized word entries)
"""
import json, io, re, sys

DEC = json.JSONDecoder()

def parse_all(path):
    with io.open(path, encoding='utf-8') as f:
        txt = f.read()
    out, i = [], 0
    while i < len(txt):
        while i < len(txt) and txt[i] in ' \r\n\t':
            i += 1
        if i >= len(txt):
            break
        obj, i = DEC.raw_decode(txt, i)
        out.append(obj)
    return out

def norm_word(raw):
    """Extract fields we want from one kajweb entry."""
    try:
        head = raw['headWord'].strip()
        wc = raw['content']['word']['content']
        trans = wc.get('trans') or []
        # build concise translation string: pos + cn
        defs = []
        for t in trans:
            pos = t.get('pos', '')
            cn = t.get('tranCn', '')
            if cn:
                defs.append((pos + ' ' + cn).strip())
        # sentences: prefer simple example
        sents = []
        for s in (wc.get('sentence') or {}).get('sentences') or []:
            sents.append({'en': s.get('sContent', ''), 'cn': s.get('sCn', '')})
        return {
            'w': head,
            'ph': wc.get('usphone', ''),
            'ph_uk': wc.get('ukphone', ''),
            'def': defs,
            'sent': sents[:3],
            'star': wc.get('star', 0),
        }
    except Exception:
        return None

def main():
    paths = [
        'wordlists/kajweb_cet4_1/CET4_1.json',
        'wordlists/kajweb_cet4/CET4_2.json',
        'wordlists/kajweb_cet4_3/CET4_3.json',
    ]
    seen = {}
    order = []
    for p in paths:
        for raw in parse_all(p):
            e = norm_word(raw)
            if not e or not e['w'] or not e['def']:
                continue
            key = e['w'].lower()
            if key not in seen:
                seen[key] = e
                order.append(key)
            else:
                # merge: fill missing phonetics/sentences from duplicates
                cur = seen[key]
                if not cur['ph'] and e['ph']:
                    cur['ph'] = e['ph']
                if not cur['ph_uk'] and e['ph_uk']:
                    cur['ph_uk'] = e['ph_uk']
                if not cur['sent'] and e['sent']:
                    cur['sent'] = e['sent']
    words = [seen[k] for k in order]
    # sort alphabetically
    words.sort(key=lambda e: e['w'].lower())
    with io.open('wordlists/pets3_words.json', 'w', encoding='utf-8') as f:
        json.dump(words, f, ensure_ascii=False, separators=(',', ':'))
    print('total unique words:', len(words))
    # stats
    with_ph = sum(1 for e in words if e['ph'])
    with_sent = sum(1 for e in words if e['sent'])
    print('with us phonetic:', with_ph, '| with sentence:', with_sent)
    # sample
    for e in words[:3]:
        print(json.dumps(e, ensure_ascii=False)[:220])

if __name__ == '__main__':
    main()
