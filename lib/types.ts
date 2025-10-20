export interface Trip {
  id: string
  user_id: string
  origin: string
  destination: string
  waypoints_json?: any[]
  distance_km: number
  duration_min: number
  toll_est: number
  fuel_cost: number
  rent_cost: number
  park_cost: number
  headcount: number
  total: number
  per_person: number
  created_at: string
}

export interface Vehicle {
  id: string
  user_id: string
  name: string
  fuel_type: "gasoline" | "hybrid" | "ev"
  efficiency_kml: number
  notes?: string
  updated_at: string
}

export interface Settings {
  user_id: string
  fuel_price: number
  toll_coeffs_json: {
    base: number
    per_km: number
  }
  rounding_mode: "ceil" | "floor" | "round"
}

export interface RouteSearchParams {
  origin: string
  destination: string
  fuelEfficiency: number
  headcount: number
}

export interface RouteResult {
  distance_km: number
  duration_min: number
  toll_est: number
  fuel_cost: number
  total: number
  per_person: number
}
