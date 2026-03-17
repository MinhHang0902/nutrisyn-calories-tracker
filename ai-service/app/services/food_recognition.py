import os
import io
import torch
from PIL import Image
from typing import Optional, List
import numpy as np

FOOD_101_CLASSES = [
    "apple_pie", "baby_back_ribs", "baklava", "beef_carpaccio", "beef_tartare", "beet_salad",
    "beignets", "bibimbap", "bread_pudding", "breakfast_burrito", "bruschetta", "caesar_salad",
    "cannoli", "caprese_salad", "carrot_cake", "ceviche", "cheese_plate", "chicken_curry",
    "chicken_quesadilla", "chicken_wings", "chocolate_cake", "chocolate_mousse", "churros",
    "clam_chowder", "club_sandwich", "crab_cakes", "creme_brulee", "croque_madame",
    "cup_cakes", "deviled_eggs", "dumplings", "edamame", "eggs_benedict", "escargots",
    "falafel", "filet_mignon", "fish_and_chips", "foie_gras", "french_fries", "french_onion_soup",
    "french_toast", "fried_calamari", "fried_rice", "frozen_yogurt", "garlic_bread", "gnocchi",
    "greek_salad", "grilled_cheese", "grilled_salmon", "guacamole", "gyoza", "hamburger",
    "hot_and_sour_soup", "hot_dog", "huevos_rancheros", "hummus", "ice_cream", "lasagna",
    "lobster_bisque", "lobster_roll_sandwich", "macaroni_and_cheese", "macarons", "miso_soup",
    "mussels", "nachos", "omelette", "onion_rings", "oysters", "pad_thai", "paella",
    "pancakes", "panna_cotta", "peking_duck", "pho", "pizza", "pork_chop", "poutine",
    "prime_rib", "pulled_pork_sandwich", "ramen", "ravioli", "red_velvet_cake", "risotto",
    "samosa", "sashimi", "scallops", "seaweed_salad", "shrimp_and_grits", "spaghetti_bolognese",
    "spaghetti_carbonara", "spring_rolls", "steak", "strawberry_shortcake", "sushi", "tacos",
    "tiramisu", "tuna_tartare", "waffle"
]

FOOD_NAME_MAPPING = {
    "pizza": "pizza", "hamburger": "burger", "hot_dog": "hot dog", "french_fries": "fries",
    "ice_cream": "ice cream", "chocolate_cake": "chocolate cake", "bread_pudding": "bread pudding",
    "croque_madame": "grilled cheese sandwich", "macaroni_and_cheese": "mac and cheese",
    "grilled_cheese": "grilled cheese", "caesar_salad": "caesar salad", "greek_salad": "greek salad",
    "chicken_wings": "chicken wings", "sushi": "sushi", "ramen": "ramen", "pho": "pho",
    "tacos": "tacos", "burritos": "burrito", "nachos": "nachos", "dumplings": "dumplings",
    "gyoza": "dumplings", "falafel": "falafel", "egg": "egg", "eggs_benedict": "eggs benedict",
    "pancakes": "pancakes", "waffle": "waffle", "french_toast": "french toast",
    "steak": "steak", "filet_mignon": "steak", "prime_rib": "steak", "beef_carpaccio": "beef",
    "beef_tartare": "beef", "salmon": "salmon", "grilled_salmon": "salmon", "tuna_tartare": "tuna",
    "sashimi": "sashimi", "shrimp_and_grits": "shrimp", "crab_cakes": "crab cakes",
    "lobster_bisque": "lobster bisque", "lobster_roll_sandwich": "lobster roll",
    "clam_chowder": "clam chowder", "mussels": "mussels", "oysters": "oysters",
    "scallops": "scallops", "seaweed_salad": "seaweed salad", "guacamole": "guacamole",
    "hummus": "hummus", "edamame": "edamame", "spring_rolls": "spring rolls",
    "ceviche": "ceviche", "samosa": "samosa", "risotto": "risotto", "lasagna": "lasagna",
    "spaghetti_bolognese": "spaghetti bolognese", "spaghetti_carbonara": "spaghetti carbonara",
    "pad_thai": "pad thai", "fried_rice": "fried rice", "bibimbap": "bibimbap",
    "miso_soup": "miso soup", "foie_gras": "foie gras", "escargots": "escargots",
    "beignets": "beignets", "churros": "churros", "donuts": "donut", "cup_cakes": "cupcake",
    "cheese_plate": "cheese", "carrot_cake": "carrot cake", "red_velvet_cake": "red velvet cake",
    "strawberry_shortcake": "strawberry shortcake", "tiramisu": "tiramisu",
    "chocolate_mousse": "chocolate mousse", "creme_brulee": "creme brulee",
    "panna_cotta": "panna cotta", "baklava": "baklava", "cannoli": "cannoli",
    "macarons": "macarons", "deviled_eggs": "deviled eggs", "club_sandwich": "club sandwich",
    "pulled_pork_sandwich": "pulled pork sandwich", "bruschetta": "bruschetta",
    "garlic_bread": "garlic bread", "onion_rings": "onion rings", "gnocchi": "gnocchi",
    "ravioli": "ravioli", "huevos_rancheros": "huevos rancheros", "breakfast_burrito": "breakfast burrito",
    "chicken_quesadilla": "chicken quesadilla", "chicken_curry": "chicken curry",
    "beet_salad": "beet salad", "caprese_salad": "caprese salad", "tomato_salad": "tomato salad",
    "baby_back_ribs": "bbq ribs", "pork_chop": "pork chop", "poutine": "poutine",
    "frozen_yogurt": "frozen yogurt", "paella": "paella", "bibimbap": "bibimbap"
}

class FoodRecognitionModel:
    def __init__(self):
        self.model = None
        self.processor = None
        self.labels = FOOD_101_CLASSES
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._load_model()
    
    def _load_model(self):
        try:
            from transformers import AutoModelForImageClassification, AutoImageProcessor
            
            model_options = [
                "ashleykleynhans/vit-finetuned-food101",
                "dima806/food_image_detection",
                "TylerF/ResNet-50-Food-Classification"
            ]
            
            for model_name in model_options:
                try:
                    print(f"Trying food recognition model: {model_name}...")
                    self.processor = AutoImageProcessor.from_pretrained(model_name)
                    self.model = AutoModelForImageClassification.from_pretrained(model_name)
                    self.model.to(self.device)
                    self.model.eval()
                    print(f"Food recognition model loaded: {model_name} on {self.device}")
                    return
                except Exception as e:
                    print(f"Model {model_name} failed: {str(e)[:50]}")
                    continue
            
            raise Exception("All models failed")
            
        except Exception as e:
            print(f"Failed to load model: {e}")
            try:
                from transformers import AutoModelForImageClassification, AutoImageProcessor
                model_name = "microsoft/resnet-50"
                print(f"Trying fallback model: {model_name}...")
                self.processor = AutoImageProcessor.from_pretrained(model_name)
                self.model = AutoModelForImageClassification.from_pretrained(model_name)
                self.model.to(self.device)
                self.model.eval()
                self.labels = FOOD_101_CLASSES
                print(f"Fallback model loaded successfully on {self.device}")
            except Exception as e2:
                print(f"Fallback model also failed: {e2}")
                self.model = None
    
    def predict(self, image: Image.Image, top_k: int = 8) -> List[dict]:
        if self.model is None or self.processor is None:
            return []
        
        try:
            image = image.convert("RGB")
            
            inputs = self.processor(images=image, return_tensors="pt")
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits
            
            probs = torch.nn.functional.softmax(logits, dim=-1)
            top_probs, top_indices = probs.topk(top_k)
            
            results = []
            for prob, idx in zip(top_probs[0], top_indices[0]):
                idx_item = idx.item()
                if idx_item < len(self.labels):
                    class_name = self.labels[idx_item]
                    mapped_name = FOOD_NAME_MAPPING.get(class_name, class_name.replace("_", " "))
                    results.append({
                        "name": mapped_name,
                        "original_name": class_name,
                        "confidence": round(prob.item(), 3)
                    })
            
            return results
            
        except Exception as e:
            print(f"Prediction error: {e}")
            return []

food_model = FoodRecognitionModel()

def analyze_with_local_model(image: Image.Image) -> List[dict]:
    """Use local model to recognize food in image."""
    predictions = food_model.predict(image, top_k=10)
    return predictions
