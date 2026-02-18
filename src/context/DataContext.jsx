import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';

const initialState = {
  datasets: [],
  activeDatasetId: null,
  activeGraphConfig: {
    xAxis: '',
    yAxis: '',
    xUnit: '',
    yUnit: '',
    chartType: 'line',
    logScaleX: false,
    logScaleY: false,
    zoomDomain: null,
    xTransform: null,  // { id: 'sqrt', secondColumn?: 'columnB' } or null
    yTransform: null,
  },
  selectedRegion: null,
  fullWidth: false,
};

const ACTIONS = {
  ADD_DATASET: 'ADD_DATASET',
  SET_ACTIVE_DATASET: 'SET_ACTIVE_DATASET',
  DELETE_RECENT_DATASET: 'DELETE_RECENT_DATASET', // New action
  UPDATE_GRAPH_CONFIG: 'UPDATE_GRAPH_CONFIG',
  SET_SELECTED_REGION: 'SET_SELECTED_REGION',
  RENAME_HEADER: 'RENAME_HEADER',
  TOGGLE_FULL_WIDTH: 'TOGGLE_FULL_WIDTH',
};

function dataReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_DATASET: {
      const newDatasets = [...state.datasets, action.payload];
      // Persist last 10 to localStorage
      try {
        const toStore = newDatasets.slice(-10).map(ds => ({
          id: ds.id, name: ds.name, headers: ds.headers,
          data: ds.data.slice(0, 500), // limit rows for storage
          savedAt: Date.now(),
        }));
        localStorage.setItem('scigraph-recent', JSON.stringify(toStore));
      } catch (_) { /* quota exceeded — ignore */ }
      return {
        ...state,
        datasets: newDatasets,
        activeDatasetId: action.payload.id,
        activeGraphConfig: {
          ...state.activeGraphConfig,
          xAxis: action.payload.headers[0] || '',
          yAxis: action.payload.headers[1] || '',
          xUnit: '',
          yUnit: '',
          zoomDomain: null,
          xTransform: null,
          yTransform: null,
        }
      };
    }
    case ACTIONS.SET_ACTIVE_DATASET: {
      const dataset = state.datasets.find(d => d.id === action.payload);
      const currentX = state.activeGraphConfig.xAxis;
      const currentY = state.activeGraphConfig.yAxis;

      // Check if current axes exist in new dataset
      const hasX = dataset?.headers.includes(currentX);
      const hasY = dataset?.headers.includes(currentY);

      return {
        ...state,
        activeDatasetId: action.payload,
        selectedRegion: null,
        activeGraphConfig: {
          ...state.activeGraphConfig,
          // Reset axes if they don't match, otherwise keep them (hot swap)
          xAxis: hasX ? currentX : (dataset?.headers[0] || ''),
          yAxis: hasY ? currentY : (dataset?.headers[1] || ''),
          zoomDomain: null,
          xTransform: null,
          yTransform: null,
        },
      };
    }
    case ACTIONS.DELETE_RECENT_DATASET: {
      // This action mainly triggers a side effect of updating localStorage
      // The state itself doesn't fundamentally change its active structure unless the deleted one was active?
      // Actually, 'recentDatasets' is derived from localStorage in the component, but we can manage the deletion here if we want strict flux.
      // However, since recentDatasets is managed via localStorage + useState hook in provider, we might just update LS there.
      // But let's assume we want to update the in-mem datasets list if we treated them as 'recent' history?
      // Wait, 'datasets' in state are *open* workspaces. 'recent' is valid storage.
      // We'll handle LS update in the Provider helper for simplicity, or here.
      // Let's keep the reducer focused on 'state.datasets' (Open files).
      // If we want to delete from 'Open Files', we'd use REMOVE_DATASET.
      // The user asked to delete from 'Recent'. Recent is stored in LS.
      // So this might not be a reducer action for *state*, but we can return state as is.
      return state;
    }
    case ACTIONS.UPDATE_GRAPH_CONFIG:
      return {
        ...state,
        activeGraphConfig: { ...state.activeGraphConfig, ...action.payload },
      };
    case ACTIONS.SET_SELECTED_REGION:
      return {
        ...state,
        selectedRegion: action.payload,
      };
    case ACTIONS.RENAME_HEADER: {
      const { datasetId, oldName, newName } = action.payload;
      if (!newName || newName === oldName) return state;
      return {
        ...state,
        datasets: state.datasets.map(ds => {
          if (ds.id !== datasetId) return ds;
          return {
            ...ds,
            headers: ds.headers.map(h => h === oldName ? newName : h),
            data: ds.data.map(row => {
              const newRow = {};
              for (const key of Object.keys(row)) {
                newRow[key === oldName ? newName : key] = row[key];
              }
              return newRow;
            }),
          };
        }),
        activeGraphConfig: {
          ...state.activeGraphConfig,
          xAxis: state.activeGraphConfig.xAxis === oldName ? newName : state.activeGraphConfig.xAxis,
          yAxis: state.activeGraphConfig.yAxis === oldName ? newName : state.activeGraphConfig.yAxis,
        },
      };
    }
    case ACTIONS.TOGGLE_FULL_WIDTH:
      return { ...state, fullWidth: !state.fullWidth };
    default:
      return state;
  }
}

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const [recentDatasets, setRecentDatasets] = useState([]);
  const activeDataset = state.datasets.find(d => d.id === state.activeDatasetId);

  // Load recent datasets from localStorage on mount
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('scigraph-recent') || '[]');
      setRecentDatasets(stored);
    } catch (_) { /* ignore */ }
  }, []);

  // Update recent datasets list whenever datasets change
  useEffect(() => {
    if (state.datasets.length > 0) {
      try {
        const stored = JSON.parse(localStorage.getItem('scigraph-recent') || '[]');
        setRecentDatasets(stored);
      } catch (_) { /* ignore */ }
    }
  }, [state.datasets]);

  const loadRecentDataset = (ds) => {
    // Check if already loaded
    const existing = state.datasets.find(d => d.id === ds.id);
    if (existing) {
      dispatch({ type: ACTIONS.SET_ACTIVE_DATASET, payload: ds.id });
    } else {
      dispatch({ type: ACTIONS.ADD_DATASET, payload: { id: ds.id, name: ds.name, headers: ds.headers, data: ds.data } });
    }
  };

  const removeRecentDataset = (id) => {
    try {
      const stored = JSON.parse(localStorage.getItem('scigraph-recent') || '[]');
      const updated = stored.filter(ds => ds.id !== id);
      localStorage.setItem('scigraph-recent', JSON.stringify(updated));
      setRecentDatasets(updated);
    } catch (_) { /* ignore */ }
  };

  return (
    <DataContext.Provider value={{ state, dispatch, actions: ACTIONS, activeDataset, recentDatasets, loadRecentDataset, removeRecentDataset }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
}
