import re

with open("bookstore-app/public/index.html", "r") as f:
    text = f.read()

# For every modal form, we append an <input type="hidden" name="id"> inside <form> before modal-header.
text = re.sub(r'(<form[^>]+id="([^"]+Form)"[^>]*>)', r'\1\n                    <input type="hidden" name="id" class="entity-id-input">', text)

with open("bookstore-app/public/index.html", "w") as f:
    f.write(text)

