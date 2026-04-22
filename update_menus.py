import os
import re

new_menu = '''        <div class="side-menu" id="menu">
            <a href="index.html">Home</a>
            <a href="index.html#services">Services</a>
            <a href="index.html#industries">Industries</a>
            <a href="tech_page.html" style="font-size: 14px; margin-left: 20px;">- Technology</a>
            <a href="real_estate.html" style="font-size: 14px; margin-left: 20px;">- Real Estate</a>
            <a href="automobile.html" style="font-size: 14px; margin-left: 20px;">- Automobile</a>
            <a href="e-commerce.html" style="font-size: 14px; margin-left: 20px;">- E-Commerce</a>
            <a href="media.html" style="font-size: 14px; margin-left: 20px;">- Media</a>
            <a href="marketing.html" style="font-size: 14px; margin-left: 20px;">- Marketing</a>
            <a href="retail.html" style="font-size: 14px; margin-left: 20px;">- Retail</a>
            <a href="index.html#contact">Contact</a>
        </div>'''

for f in os.listdir('.'):
    if f.endswith('.html'):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Replace side-menu div
        pattern = r'<div class="side-menu" id="menu">.*?</div>'
        updated = re.sub(pattern, new_menu, content, flags=re.DOTALL)
        
        with open(f, 'w', encoding='utf-8') as file:
            file.write(updated)
