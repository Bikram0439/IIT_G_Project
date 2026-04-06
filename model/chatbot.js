require('dotenv').config();
const Plant = require('./plants');

console.log("=".repeat(50));
console.log("🔧 PRATHA CHATBOT - FINAL VERSION");
console.log("=".repeat(50));

// ============================
// 🧹 QUERY CLEANING
// ============================

function cleanQueryForSearch(query) {
    let cleaned = query
        .toLowerCase()
        .replace(/tell me about|what is|what are|about|uses of|benefits of|info on|information on|can you|please|tell me/gi, '')
        .replace(/[?.,!]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    return cleaned;
}

// ============================
// 🌿 EXTRACT SEARCH TERMS FROM QUERY
// ============================

function extractSearchTerms(query) {
    const lower = query.toLowerCase();
    
    // Check for "plants for X" pattern
    const plantsForMatch = lower.match(/plants? for (\w+)/i);
    if (plantsForMatch) {
        return { type: 'condition', term: plantsForMatch[1] };
    }
    
    // Check for "medicinal plants for X"
    const medicinalForMatch = lower.match(/medicinal plants? for (\w+)/i);
    if (medicinalForMatch) {
        return { type: 'condition', term: medicinalForMatch[1] };
    }
    
    // Check for specific plant names
    const plantNames = ['neem', 'tulsi', 'aloe', 'ashwagandha', 'turmeric', 'ginger', 'garlic', 'brahmi', 'amla', 'giloy', 'moringa'];
    for (const plant of plantNames) {
        if (lower.includes(plant)) {
            return { type: 'plant', term: plant };
        }
    }
    
    // Default - use as is
    return { type: 'general', term: cleanQueryForSearch(query) };
}

// ============================
// 🌿 DATABASE SEARCH - SEARCHES USES FIELD TOO
// ============================

async function searchPlants(query) {
    try {
        const extracted = extractSearchTerms(query);
        console.log(`🔍 Search type: ${extracted.type}, term: "${extracted.term}"`);

        if (extracted.term.length < 2) {
            return [];
        }
        
        let searchConditions = [];
        
        // For condition searches (like "fever", "skin care")
        if (extracted.type === 'condition') {
            // Search in uses field for the condition
            searchConditions = [
                { uses: { $regex: extracted.term, $options: 'i' } },
                { uses: { $regex: `\\b${extracted.term}\\b`, $options: 'i' } }
            ];
        } 
        // For plant name searches
        else if (extracted.type === 'plant') {
            searchConditions = [
                { scientificName: { $regex: extracted.term, $options: 'i' } },
                { englishName: { $regex: extracted.term, $options: 'i' } },
                { localName: { $regex: extracted.term, $options: 'i' } },
                { hindiName: { $regex: extracted.term, $options: 'i' } },
                { assameseName: { $regex: extracted.term, $options: 'i' } }
            ];
        }
        // General search
        else {
            searchConditions = [
                { scientificName: { $regex: extracted.term, $options: 'i' } },
                { englishName: { $regex: extracted.term, $options: 'i' } },
                { localName: { $regex: extracted.term, $options: 'i' } },
                { uses: { $regex: extracted.term, $options: 'i' } }
            ];
        }
        
        const allMatches = await Plant.find({ $or: searchConditions });
        
        // Remove duplicates
        const uniquePlants = [];
        const seenNames = new Set();
        
        for (const plant of allMatches) {
            const nameKey = plant.scientificName.toLowerCase();
            if (!seenNames.has(nameKey)) {
                seenNames.add(nameKey);
                uniquePlants.push(plant);
            }
        }
        
        console.log(`✅ Found ${uniquePlants.length} plant(s) for "${extracted.term}"`);
        return uniquePlants;
        
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

// ============================
// 🌿 PLANT RESPONSE
// ============================

function buildPlantResponse(plants, query) {
    let response = '';
    
    response += `🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿\n`;
    response += `🌿        PRATHA MEDICINAL PLANT DATABASE        🌿\n`;
    response += `🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿\n\n`;
    
    if (plants.length === 1) {
        response += `📊 Found 1 medicinal plant:\n\n`;
    } else {
        response += `📊 Found ${plants.length} medicinal plants:\n\n`;
    }
    
    plants.forEach((p, index) => {
        const commonName = p.englishName || p.localName || 'traditional herb';
        
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `🌿 ${p.scientificName}\n`;
        if (p.englishName) response += `📝 ${p.englishName}\n`;
        if (p.localName) response += `🏠 ${p.localName}\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        response += `📖 INTRODUCTION:\n`;
        response += `${p.scientificName} (${commonName}) is a valuable medicinal plant used in traditional medicine for centuries. It contains various bioactive compounds that provide therapeutic benefits.\n\n`;
        
        response += `📋 DETAILS:\n`;
        if (p.scientificName) response += `   🔬 Scientific Name: ${p.scientificName}\n`;
        if (p.englishName) response += `   📝 English Name: ${p.englishName}\n`;
        if (p.localName) response += `   🏠 Local Name: ${p.localName}\n`;
        if (p.hindiName) response += `   🇮🇳 Hindi Name: ${p.hindiName}\n`;
        if (p.assameseName) response += `   🎋 Assamese Name: ${p.assameseName}\n`;
        if (p.partsUsed) response += `   🔧 Parts Used: ${p.partsUsed}\n`;
        if (p.uses) response += `   💊 Medicinal Uses: ${p.uses}\n`;
        
        response += `\n`;
        
        if (index < plants.length - 1) {
            response += `───────────────────────────────────────────────\n\n`;
        }
    });
    
    response += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    response += `✅ CONCLUSION:\n`;
    response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    response += `Medicinal plants offer natural healing solutions with fewer side effects when used properly. However, always consult a healthcare professional before using any plant for medicinal purposes.\n\n`;
    response += `⚠️ DISCLAIMER: This information is for educational purposes only. Please consult a qualified healthcare practitioner before use.\n`;
    response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    return response;
}

// ============================
// 📝 FALLBACK FOR GENERAL QUESTIONS (NO DB RESULTS)
// ============================

function getFallbackResponse(query, totalCount) {
    const lower = query.toLowerCase();
    
    // Plants for fever
    if (lower.includes('fever')) {
        return `🌿 MEDICINAL PLANTS FOR FEVER in PRATHA Database:

🌿 Alstonia scholaris (Chatiana) - Malaria fever
🌿 Saccharum officinarum (Kuhiyar) - Fever
🌿 Scoparia dulcis (Senibon) - Fever, cough
🌿 Ocimum sanctum (Tulsi) - Cold and cough
🌿 Azadirachta indica (Neem) - Pox, measles

📚 Ask about any specific plant for detailed information!

⚠️ Always consult a healthcare professional before use.`;
    }
    
    // Plants for skin care
    if (lower.includes('skin')) {
        return `🌿 MEDICINAL PLANTS FOR SKIN CARE in PRATHA Database:

🌿 Aloe vera - Burns, wounds, skin infection
🌿 Neem (Azadirachta indica) - Skin disease, itching, boils
🌿 Turmeric - Anti-inflammatory, healing
🌿 Tulsi - Skin infections
🌿 Argemone mexicana - Skin disease, herpes

📚 Ask "Aloe vera" or "Neem" for complete details!

⚠️ Always do a patch test before applying.`;
    }
    
    // Ashwagandha
    if (lower.includes('ashwagandha')) {
        return `🌿 ASHWAGANDHA (Withania somnifera) - "Indian Ginseng"

✨ KEY BENEFITS:
• Reduces stress, anxiety, and depression
• Boosts brain function and memory
• Increases strength and muscle mass
• Supports immune system
• Lowers blood sugar and cortisol
• Improves sleep quality

💊 Traditional Uses: Insomnia, arthritis, infertility, fatigue

⚠️ Consult doctor before use, especially if pregnant or on medication.`;
    }
    
    // Aloe vera
    if (lower.includes('aloe')) {
        return `🌿 ALOE VERA Medicinal Uses:

✨ KEY BENEFITS:
• Heals burns and wounds
• Moisturizes skin
• Treats acne and sunburn
• Aids digestion
• Boosts immune system
• Reduces dental plaque

💊 Found in PRATHA Database with ${totalCount}+ plants!

📚 Ask "Aloe vera" to see all database entries!`;
    }
    
    // Default
    return `🌿 PRATHA Medicinal Plants Database - IIT Guwahati

📚 Database contains ${totalCount}+ medicinal plants from Assam and Northeast India.

💡 TRY ASKING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🌿 "Neem" - All Neem plant information
   🌱 "Tulsi" - Tulsi benefits and uses
   🍃 "Aloe vera" - Aloe vera medicinal uses
   🌸 "Ashwagandha" - Ashwagandha benefits
   💊 "Plants for fever" - Find fever remedies
   🧴 "Plants for skin care" - Skin care plants

⚠️ Always consult a healthcare professional before using any medicinal plants.`;
}

// ============================
// 🧠 MAIN CHAT FUNCTION
// ============================

async function chatbotReply(message) {
    try {
        const total = await Plant.countDocuments();
        console.log(`\n💬 User: "${message}"`);
        console.log(`📊 Total plants: ${total}`);

        // ALWAYS SEARCH DATABASE FIRST for everything
        const plants = await searchPlants(message);
        
        if (plants.length > 0) {
            console.log(`✅ Found ${plants.length} plant(s) in DB - Showing results`);
            return buildPlantResponse(plants, message);
        }
        
        // Only use fallback if NO plants found in database
        console.log(`❌ No plants found in DB - Using fallback response`);
        return getFallbackResponse(message, total);
        
    } catch (error) {
        console.error('Chatbot error:', error);
        return getFallbackResponse(message, 367);
    }
}

module.exports = { chatbotReply };