import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

// Singleton model reference
let modelPromise = null;
let loadedModel = null;

/**
 * Known e-waste and electronics taxonomy mapping for COCO-SSD detected classes
 */
export const EWASTE_TAXONOMY = {
  'cell phone': {
    name: 'Smartphone / Mobile Device',
    category: 'Small Electronics & Mobile',
    condition: 'Reusable / Recyclable',
    ecoPoints: 50,
    co2Saved: '4.2 kg',
    rareMaterials: 'Gold, Silver, Palladium, Copper, Lithium, Cobalt',
    hazardLevel: 'Medium (Lithium-Ion Battery)',
    recommendation: 'Eligible for student donation refurbishing or certified e-waste collection. Do not puncture battery.',
    isEwaste: true,
  },
  'laptop': {
    name: 'Laptop / Notebook Computer',
    category: 'Computing & IT Equipment',
    condition: 'Refurbishable / Recyclable',
    ecoPoints: 150,
    co2Saved: '14.5 kg',
    rareMaterials: 'Copper, Gold, Aluminum, Neodymium magnets, Tantalum',
    hazardLevel: 'Medium (Li-ion Battery & LCD backlighting)',
    recommendation: 'Excellent candidate for educational donation refurbishing or authorized doorstep pickup.',
    isEwaste: true,
  },
  'tv': {
    name: 'Television / Display Monitor',
    category: 'Consumer Displays & TVs',
    condition: 'Recyclable Electronics',
    ecoPoints: 200,
    co2Saved: '22.0 kg',
    rareMaterials: 'Indium Tin Oxide, Copper wiring, Aluminum chassis, Circuit Glass',
    hazardLevel: 'Medium (Fragile Glass, Heavy Metals)',
    recommendation: 'Schedule doorstep pickup for safe transport to avoid glass breakage and chemical leakage.',
    isEwaste: true,
  },
  'keyboard': {
    name: 'Computer Keyboard',
    category: 'Computer Peripherals',
    condition: 'Recyclable Plastic & Circuitry',
    ecoPoints: 35,
    co2Saved: '1.8 kg',
    rareMaterials: 'ABS Plastics, Copper traces, Steel backplate',
    hazardLevel: 'Low',
    recommendation: 'Drop off at any campus EcoNexis kiosk or student lab donation box.',
    isEwaste: true,
  },
  'mouse': {
    name: 'Optical Mouse / Pointing Device',
    category: 'Computer Peripherals',
    condition: 'Recyclable Peripheral',
    ecoPoints: 20,
    co2Saved: '0.8 kg',
    rareMaterials: 'Thermoplastics, Copper wiring, Optical Sensor silicon',
    hazardLevel: 'Low',
    recommendation: 'Safe for standard electronic collection kiosks and copper wiring recovery.',
    isEwaste: true,
  },
  'remote': {
    name: 'Remote Controller / Wireless Device',
    category: 'Small Electronics & Accessories',
    condition: 'Recyclable Electronics',
    ecoPoints: 25,
    co2Saved: '1.1 kg',
    rareMaterials: 'Silicon ICs, Copper contacts, Polycarbonate',
    hazardLevel: 'Low (Remove Alkaline/NiMH batteries prior to drop-off)',
    recommendation: 'Remove dry cell batteries before depositing in campus e-waste bins.',
    isEwaste: true,
  },
  'microwave': {
    name: 'Microwave Oven',
    category: 'Small Home Appliances',
    condition: 'Heavy E-Waste',
    ecoPoints: 120,
    co2Saved: '18.5 kg',
    rareMaterials: 'Copper transformer coils, Sheet Steel, Magnetron metals',
    hazardLevel: 'High Voltage Capacitor (Do not open chassis)',
    recommendation: 'Schedule certified technician doorstep pickup. Do not disassemble high-voltage components.',
    isEwaste: true,
  },
  'toaster': {
    name: 'Electric Toaster / Heating Appliance',
    category: 'Small Home Appliances',
    condition: 'Recyclable Appliance',
    ecoPoints: 40,
    co2Saved: '3.2 kg',
    rareMaterials: 'Nichrome heating elements, Stainless Steel, Mica insulation',
    hazardLevel: 'Low',
    recommendation: 'Deposit at certified e-waste aggregation centers for metal sorting.',
    isEwaste: true,
  },
  'refrigerator': {
    name: 'Refrigerator / Cooling Appliance',
    category: 'Large Home Appliances',
    condition: 'Heavy E-Waste / White Goods',
    ecoPoints: 300,
    co2Saved: '45.0 kg',
    rareMaterials: 'Copper tubing, Steel, Aluminum compressor components',
    hazardLevel: 'High (Refrigerant Gas & Compressor Oil)',
    recommendation: 'Requires specialized refrigerant degassing and certified bulk transport.',
    isEwaste: true,
  },
  'clock': {
    name: 'Electronic Clock / Digital Timer',
    category: 'Small Electronics',
    condition: 'Recyclable Electronics',
    ecoPoints: 20,
    co2Saved: '0.9 kg',
    rareMaterials: 'Quartz crystal resonator, Copper coils, LCD display',
    hazardLevel: 'Low',
    recommendation: 'Deposit at any EcoNexis campus collection smart bin.',
    isEwaste: true,
  },
  'hair drier': {
    name: 'Electric Hair Dryer / Styling Tool',
    category: 'Personal Care Appliances',
    condition: 'Recyclable Appliance',
    ecoPoints: 30,
    co2Saved: '1.5 kg',
    rareMaterials: 'Copper motor windings, Nichrome wire, Mica',
    hazardLevel: 'Low',
    recommendation: 'Safe for kiosk drop-off or doorstep pickup collection.',
    isEwaste: true,
  },
  'oven': {
    name: 'Electric Oven / Cooktop',
    category: 'Large Home Appliances',
    condition: 'Heavy E-Waste',
    ecoPoints: 180,
    co2Saved: '28.0 kg',
    rareMaterials: 'Stainless Steel, Copper wiring, Ceramic heating elements',
    hazardLevel: 'Medium',
    recommendation: 'Schedule campus logistics or municipal bulk e-waste pickup.',
    isEwaste: true,
  }
};

/**
 * Load COCO-SSD object detection model (cached singleton)
 */
export async function loadAiModel() {
  if (loadedModel) return loadedModel;
  if (!modelPromise) {
    modelPromise = (async () => {
      await tf.ready();
      const model = await cocoSsd.load({
        base: 'lite_mobilenet_v2', // Lightweight and fast for browser execution
      });
      loadedModel = model;
      return model;
    })();
  }
  return modelPromise;
}

/**
 * Check if the model is currently loaded
 */
export function isModelReady() {
  return loadedModel !== null;
}

/**
 * Render detection bounding boxes and confidence pills directly on canvas
 * @param {HTMLCanvasElement} canvas
 * @param {Array} predictions - Array of COCO-SSD prediction objects
 * @param {number} displayWidth - Video or container display width
 * @param {number} displayHeight - Video or container display height
 */
export function drawDetectionsOnCanvas(canvas, predictions, displayWidth, displayHeight) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = displayWidth || 640;
  canvas.height = displayHeight || 480;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!predictions || predictions.length === 0) return;

  predictions.forEach((prediction) => {
    const [x, y, width, height] = prediction.bbox;
    const isEwasteItem = !!EWASTE_TAXONOMY[prediction.class.toLowerCase()];
    const strokeColor = isEwasteItem ? '#10b981' : '#3b82f6';
    const fillColor = isEwasteItem ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)';
    const confidencePct = Math.round(prediction.score * 100);
    const labelText = `${prediction.class.toUpperCase()} • ${confidencePct}%`;

    // 1. Draw bounding box rectangle
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);

    // Fill semi-transparent interior
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, width, height);

    // 2. Draw label pill above bounding box
    ctx.font = 'bold 12px Inter, sans-serif';
    const textWidth = ctx.measureText(labelText).width;
    const pillHeight = 22;
    const pillWidth = textWidth + 16;
    const pillX = Math.max(0, x);
    const pillY = Math.max(0, y - pillHeight - 4);

    // Pill background
    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 4) : ctx.rect(pillX, pillY, pillWidth, pillHeight);
    ctx.fill();

    // Pill text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(labelText, pillX + 8, pillY + 15);
  });
}

/**
 * Detect objects in an HTML image, video, or canvas element
 * @param {HTMLImageElement|HTMLVideoElement|HTMLCanvasElement} inputElement
 * @returns {Promise<{
 *   success: boolean,
 *   rawPredictions: Array,
 *   primaryDetection: Object|null,
 *   isEwaste: boolean,
 *   message?: string,
 *   recommendation?: string
 * }>}
 */
export async function detectEwasteObject(inputElement) {
  try {
    const model = await loadAiModel();
    const predictions = await model.detect(inputElement, 6, 0.3);

    if (!predictions || predictions.length === 0) {
      return {
        success: true,
        isEwaste: false,
        rawPredictions: [],
        primaryDetection: null,
        message: 'No distinct object recognized in current frame. Please ensure clear lighting and center the device in view.',
      };
    }

    // Sort predictions by confidence score descending
    predictions.sort((a, b) => b.score - a.score);

    // Look for first e-waste item match or highest confidence detection
    const ewasteMatch = predictions.find((p) => EWASTE_TAXONOMY[p.class.toLowerCase()]);
    const topDetection = ewasteMatch || predictions[0];
    const detectedClassKey = topDetection.class.toLowerCase();
    const confidencePct = Math.round(topDetection.score * 100);

    if (EWASTE_TAXONOMY[detectedClassKey]) {
      const info = EWASTE_TAXONOMY[detectedClassKey];
      return {
        success: true,
        isEwaste: true,
        rawPredictions: predictions,
        primaryDetection: {
          ...info,
          rawClass: topDetection.class,
          confidence: confidencePct,
          bbox: topDetection.bbox,
        },
      };
    }

    // Object detected but not classified as electronics
    return {
      success: true,
      isEwaste: false,
      rawPredictions: predictions,
      primaryDetection: {
        rawClass: topDetection.class,
        confidence: confidencePct,
        bbox: topDetection.bbox,
      },
      message: `Object detected as "${topDetection.class}" with ${confidencePct}% model confidence.`,
      recommendation: 'EcoNexis visual AI specializes in classifying electronic equipment (smartphones, laptops, displays, keyboards, mice, microwaves, appliances, cables). Point camera at an electronic device to evaluate precious material recovery & EcoPoints.',
    };
  } catch (error) {
    console.error('[AI Detection Error]:', error);
    return {
      success: false,
      error: error.message || 'Failed to execute AI detection model inference.',
      isEwaste: false,
      primaryDetection: null,
    };
  }
}
