// Career field categories based on standard industry classifications

import type { CareerFieldKey, CareerField } from '../types/career.types';

export const CAREER_FIELDS: Record<CareerFieldKey, CareerField> = {
  'accommodation_food': {
    name: 'Accommodation and Food Services',
    description: 'Hotels, restaurants, food service, and hospitality',
    keywords: ['hotel', 'restaurant', 'food', 'hospitality', 'lodging', 'accommodation', 'chef', 'server', 'bartender', 'housekeeper', 'concierge', 'catering', 'tourism', 'travel', 'inn', 'resort']
  },
  'admin_support': {
    name: 'Administrative and Support Services',
    description: 'Administrative, business support, and waste management services',
    keywords: ['administrative', 'support', 'clerical', 'office', 'secretary', 'assistant', 'receptionist', 'data entry', 'waste', 'cleaning', 'security', 'temp', 'staffing', 'business support']
  },
  'agriculture_forestry': {
    name: 'Agriculture, Forestry, Fishing, and Hunting',
    description: 'Farming, forestry, fishing, hunting, and agricultural support',
    keywords: ['agriculture', 'farm', 'farmer', 'forestry', 'fishing', 'hunting', 'crop', 'livestock', 'agricultural', 'forest', 'timber', 'fishery', 'ranch', 'veterinary', 'animal', 'plant']
  },
  'arts_entertainment': {
    name: 'Arts, Entertainment, and Recreation',
    description: 'Creative arts, entertainment, sports, and recreational activities',
    keywords: ['artist', 'entertainment', 'recreation', 'sports', 'creative', 'music', 'theater', 'film', 'video', 'dance', 'performer', 'athlete', 'coach', 'fitness', 'amusement', 'gambling']
  },
  'construction': {
    name: 'Construction',
    description: 'Building construction, heavy construction, and specialty trades',
    keywords: ['construction', 'building', 'contractor', 'electrician', 'plumber', 'carpenter', 'mason', 'roofer', 'painter', 'welder', 'heavy construction', 'specialty trade', 'infrastructure']
  },
  'educational': {
    name: 'Educational Services',
    description: 'Schools, colleges, universities, and educational support services',
    keywords: ['education', 'teacher', 'professor', 'instructor', 'school', 'university', 'college', 'training', 'tutor', 'librarian', 'counselor', 'principal', 'academic', 'educational']
  },
  'finance_insurance': {
    name: 'Finance and Insurance',
    description: 'Banking, insurance, securities, and financial services',
    keywords: ['finance', 'financial', 'banking', 'insurance', 'investment', 'securities', 'credit', 'loan', 'accounting', 'actuary', 'underwriter', 'broker', 'advisor', 'analyst', 'economist']
  },
  'government': {
    name: 'Government',
    description: 'Federal, state, and local government agencies and services',
    keywords: ['government', 'federal', 'state', 'local', 'public', 'civil service', 'military', 'political', 'public administration', 'policy', 'regulatory', 'municipal', 'county']
  },
  'healthcare_social': {
    name: 'Health Care and Social Assistance',
    description: 'Medical care, hospitals, nursing, and social assistance services',
    keywords: ['health', 'healthcare', 'medical', 'hospital', 'nurse', 'doctor', 'physician', 'dentist', 'pharmacy', 'therapy', 'clinical', 'social', 'mental health', 'care', 'patient']
  },
  'information': {
    name: 'Information',
    description: 'Publishing, broadcasting, telecommunications, and information services',
    keywords: ['information', 'technology', 'telecommunications', 'software', 'computer', 'data', 'internet', 'web', 'publishing', 'broadcasting', 'media', 'communications', 'IT', 'tech']
  },
  'management': {
    name: 'Management of Companies and Enterprises',
    description: 'Corporate headquarters and holding companies',
    keywords: ['management', 'corporate', 'headquarters', 'holding company', 'enterprise', 'executive', 'director', 'manager', 'administration', 'leadership', 'strategic', 'operations']
  },
  'manufacturing': {
    name: 'Manufacturing',
    description: 'Production of goods, from food to machinery',
    keywords: ['manufacturing', 'production', 'factory', 'industrial', 'assembly', 'machinist', 'operator', 'quality', 'supervisor', 'technician', 'fabrication', 'processing']
  },
  'mining_extraction': {
    name: 'Mining, Quarrying, and Oil and Gas Extraction',
    description: 'Natural resource extraction and related support activities',
    keywords: ['mining', 'quarrying', 'oil', 'gas', 'extraction', 'petroleum', 'coal', 'mineral', 'drilling', 'refinery', 'geologist', 'engineer', 'natural resources']
  },
  'other_services': {
    name: 'Other Services (Except Public Administration)',
    description: 'Repair services, personal services, and religious organizations',
    keywords: ['repair', 'maintenance', 'personal services', 'religious', 'organization', 'automotive', 'equipment', 'machinery', 'personal care', 'dry cleaning', 'funeral']
  },
  'professional_scientific': {
    name: 'Professional, Scientific, and Technical Services',
    description: 'Legal, accounting, engineering, consulting, and scientific services',
    keywords: ['professional', 'scientific', 'technical', 'legal', 'lawyer', 'attorney', 'consulting', 'engineering', 'architect', 'research', 'scientist', 'specialist', 'expert']
  },
  'real_estate': {
    name: 'Real Estate and Rental and Leasing',
    description: 'Real estate, rental, and leasing services',
    keywords: ['real estate', 'rental', 'leasing', 'property', 'realtor', 'agent', 'broker', 'landlord', 'property management', 'appraisal', 'development']
  },
  'retail_trade': {
    name: 'Retail Trade',
    description: 'Retail stores and merchandise sales',
    keywords: ['retail', 'sales', 'store', 'merchandise', 'cashier', 'clerk', 'associate', 'manager', 'customer service', 'shopping', 'commerce', 'consumer']
  },
  'transportation_warehousing': {
    name: 'Transportation and Warehousing',
    description: 'Transportation services and warehousing operations',
    keywords: ['transportation', 'warehousing', 'logistics', 'shipping', 'delivery', 'driver', 'pilot', 'freight', 'supply chain', 'distribution', 'storage', 'postal']
  },
  'utilities': {
    name: 'Utilities',
    description: 'Electric power, natural gas, water, and waste management',
    keywords: ['utilities', 'electric', 'power', 'gas', 'water', 'waste', 'energy', 'utility', 'infrastructure', 'maintenance', 'technician', 'operator']
  },
  'wholesale_trade': {
    name: 'Wholesale Trade',
    description: 'Wholesale and distribution of goods',
    keywords: ['wholesale', 'distribution', 'trade', 'distributor', 'supplier', 'sales', 'merchant', 'goods', 'inventory', 'supply']
  }
} as const;