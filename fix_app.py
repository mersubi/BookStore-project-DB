import re

with open("bookstore-app/public/app.js", "r") as f:
    text = f.read()

# Remove backslashes before dollar signs and backticks that were escaped in shell
text = text.replace(r"\${", "${").replace(r"\`", "`").replace(r"\/", "/")

with open("bookstore-app/public/app.js", "w") as f:
    f.write(text)
