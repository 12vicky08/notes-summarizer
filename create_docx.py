import zipfile

def create_docx(filename, text):
    with zipfile.ZipFile(filename, 'w') as docx:
        document_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        <w:p><w:r><w:t>{text}</w:t></w:r></w:p>
    </w:body>
</w:document>"""

        docx.writestr('word/document.xml', document_xml)

        content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>"""
        docx.writestr('[Content_Types].xml', content_types)

        rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""
        docx.writestr('_rels/.rels', rels)

create_docx('test_upload.docx', 'Artificial intelligence is rapidly reshaping the healthcare landscape, offering unprecedented opportunities to improve patient outcomes, reduce costs, and accelerate medical research. From diagnostic imaging to drug discovery, AI applications are moving from experimental labs to clinical practice at an accelerating pace. One of the most promising areas is medical imaging analysis.')
