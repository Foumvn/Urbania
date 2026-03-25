#!/usr/bin/env python3
"""Inject values into named LibreOffice Draw text objects using UNO."""
from __future__ import annotations

import argparse
import pathlib
import sys
from typing import Dict

import uno

UNO_URL = "uno:socket,host=localhost,port=2002;urp;StarOffice.ComponentContext"

def parse_mapping(entries: list[str]) -> Dict[str, str]:
    mapping: Dict[str, str] = {}
    for entry in entries:
        if "=" not in entry:
            raise argparse.ArgumentTypeError(
                f"Invalid mapping '{entry}'. Expected format NAME=value"
            )
        key, value = entry.split("=", 1)
        mapping[key.strip()] = value
    return mapping

def connect_to_office():
    local_ctx = uno.getComponentContext()
    resolver = local_ctx.ServiceManager.createInstanceWithContext(
        "com.sun.star.bridge.UnoUrlResolver", local_ctx
    )
    return resolver.resolve(UNO_URL)

def load_document(office_ctx, doc_path: pathlib.Path):
    smgr = office_ctx.ServiceManager
    desktop = smgr.createInstanceWithContext("com.sun.star.frame.Desktop", office_ctx)
    file_url = uno.systemPathToFileUrl(str(doc_path.resolve()))
    return desktop.loadComponentFromURL(file_url, "_blank", 0, ())

def fill_shapes(doc, mapping: Dict[str, str]):
    draw_pages = doc.getDrawPages()
    for i in range(draw_pages.getCount()):
        page = draw_pages.getByIndex(i)
        shapes = [shape for shape in page]  # Collect all shapes first
        for shape in shapes:
            name = getattr(shape, "Name", "")
            if name in mapping:
                if name.startswith("case_") and hasattr(shape, "State"):
                    shape.State = 1 if mapping[name].lower() == "true" else 0
                elif hasattr(shape, "String"):
                    if hasattr(shape, "getText"):
                        # Méthode qui préserve le formatage pour les zones de texte
                        text = shape.getText()
                        
                        cursor = text.createTextCursor()
                        cursor.gotoStart(False)
                        cursor.gotoEnd(True)
                        
                        props_to_preserve = {}
                        try:
                            font_props = ["CharFontName", "CharWeight", 
                                        "CharPosture", "CharColor", "CharUnderline",
                                        "CharStrikeout", "CharShadowed"]
                            for prop in font_props:
                                try:
                                    value = cursor.getPropertyValue(prop)
                                    if value is not None:
                                        props_to_preserve[prop] = value
                                except:
                                    pass
                        except:
                            pass
                        
                        # Vider le texte existant
                        cursor.setString("")
                        
                        # Créer un nouveau curseur pour l'insertion
                        new_cursor = text.createTextCursor()
                        new_cursor.gotoStart(False)
                        
                        # Appliquer les propriétés préservées
                        for prop_name, prop_value in props_to_preserve.items():
                            try:
                                new_cursor.setPropertyValue(prop_name, prop_value)
                            except:
                                pass
                        
                        # Forcer la taille de police plus petite
                        new_cursor.CharHeight = 10.0  # Taille réduite à 10pt
                        
                        # Insérer le nouveau texte
                        text.insertString(new_cursor, mapping[name], False)
                    else:
                        # Shape simple : formatage peut ne pas être préservé
                        print(f"Avertissement: '{name}' n'est pas une zone de texte - police peut changer")
                        shape.String = mapping[name]

def save_outputs(doc, odg_path: pathlib.Path, pdf_path: pathlib.Path | None):
    doc.store()
    if pdf_path:
        pdf_url = uno.systemPathToFileUrl(str(pdf_path.resolve()))
        filter_prop = uno.createUnoStruct("com.sun.star.beans.PropertyValue")
        filter_prop.Name = "FilterName"
        filter_prop.Value = "draw_pdf_Export"
        
        embed_prop = uno.createUnoStruct("com.sun.star.beans.PropertyValue")
        embed_prop.Name = "EmbedFonts"
        embed_prop.Value = True
        
        # Optimisations pour réduire la taille
        reduce_img_prop = uno.createUnoStruct("com.sun.star.beans.PropertyValue")
        reduce_img_prop.Name = "ReduceImageResolution"
        reduce_img_prop.Value = True
        
        max_res_prop = uno.createUnoStruct("com.sun.star.beans.PropertyValue")
        max_res_prop.Name = "MaxImageResolution"
        max_res_prop.Value = 96  # Réduit de 150 à 96 DPI
        
        quality_prop = uno.createUnoStruct("com.sun.star.beans.PropertyValue")
        quality_prop.Name = "Quality"
        quality_prop.Value = 75  # Qualité JPEG à 75%
        
        compress_prop = uno.createUnoStruct("com.sun.star.beans.PropertyValue")
        compress_prop.Name = "CompressMode"
        compress_prop.Value = 1  # Compression maximale
        
        doc.storeToURL(pdf_url, (filter_prop, embed_prop, reduce_img_prop, max_res_prop, quality_prop, compress_prop,))

def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Remplit un fichier ODG en mettant à jour les zones nommées"
    )
    parser.add_argument("odg", type=pathlib.Path, help="Chemin vers le fichier .odg")
    parser.add_argument(
        "--pdf",
        type=pathlib.Path,
        help="Chemin de sortie PDF (optionnel)",
    )
    parser.add_argument(
        "--set",
        metavar="CLE=VALEUR",
        nargs="+",
        default=[],
        help="Paires nom=texte correspondant aux zones nommées",
    )
    args = parser.parse_args(argv)
    mapping = parse_mapping(args.set)

    if not args.odg.exists():
        parser.error(f"Fichier introuvable: {args.odg}")

    try:
        office_ctx = connect_to_office()
    except Exception as exc:  # pylint: disable=broad-except
        parser.error(
            "Impossible de se connecter à LibreOffice. "
            "Lancez LibreOffice en mode serveur :\n"
            "libreoffice --headless --accept=\"socket,host=localhost,port=2002;urp;StarOffice.ServiceManager\""
        )

    document = load_document(office_ctx, args.odg)
    fill_shapes(document, mapping)
    save_outputs(document, args.odg, args.pdf)
    document.close(True)

if __name__ == "__main__":
    main()