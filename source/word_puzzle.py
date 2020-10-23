import re, sys

# detect word which contains a character at least twice
rgx = re.compile(r'.*(.).*\1.*') 

def filter_words(inp):
    for word in inp:
        if rgx.match(word) is None:
            yield word

for word in list(filter_words(sys.stdin)):
	print(word.rstrip());
