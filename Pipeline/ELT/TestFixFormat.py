from ftfy import fix_encoding 
text_decode = fix_encoding("TrÃ  Oolong Kim TuyÃªn Cáº§u Äáº¥t - Há»™p 220Gr")
print(text_decode)
exit()
# text = "Dá»‹ch vá»¥ & Khuyáº¿n mÃ£i"

def fix_text(text):
    text_decode = text
    for encode in ['latin-1', 'sloppy-windows-1252', 'sloppy-windows-1251', 'sloppy-windows-1250', 'sloppy-windows-1253', 'sloppy-windows-1254', 'iso-8859-2', 'macroman', 'cp437']:
        try:
            # text = "Chào tất cả mọi người"
            # text = "Dá»‹ch vá»¥ & Khuyáº¿n mÃ£i"
            text_encode = text.encode("sloppy-windows-1252")
            print(text_encode)
            # text_encode = text.encode(encode)
            text_decode = text_encode.decode("utf-8")

            
            return text_decode
        except Exception as error:
            pass
            print("An exception occurred:", error)
        
    return text_decode
    
# # print(fix_text("Dá»‹ch vá»¥ & Khuyáº¿n mÃ£i"))
# print(fix_text("TrÃ  Oolong Kim TuyÃªn Cáº§u Äáº¥t - Há»™p 220Gr"))
# print(fix_text("Chào tất cả mọi người"))
# print(fix_text("Dá»‹ch vá»¥ & Khuyáº¿n mÃ£i"))