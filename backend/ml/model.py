import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier, VotingClassifier
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
from ml.feature_engineering import FEATURE_COLUMNS, build_features, prepare_dataset

MODEL_PATH = os.path.join(os.path.dirname(__file__), "crypto_ensemble_model.joblib")

class CryptoPredictor:
    def __init__(self):
        self.model = None
        self.feature_importances = {}
        self.metrics = {
            "accuracy": 0.0,
            "precision": 0.0,
            "recall": 0.0,
            "f1": 0.0,
            "cv_folds": 5,
            "samples_trained": 0
        }
        self.is_trained = False
        self._try_load_model()

    def _try_load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                saved = joblib.load(MODEL_PATH)
                self.model = saved.get("model")
                self.feature_importances = saved.get("feature_importances", {})
                self.metrics = saved.get("metrics", self.metrics)
                self.is_trained = True
            except Exception as e:
                print(f"Notice: Could not load saved model: {e}")

    def train(self, df: pd.DataFrame, horizon: int = 6, threshold: float = 0.0075) -> dict:
        """
        Trains the Ensemble ML Model using TimeSeriesSplit Cross-Validation.
        """
        X, y, _ = prepare_dataset(df, horizon=horizon, threshold=threshold)

        if len(X) < 100:
            raise ValueError(f"Insufficient training samples ({len(X)}). Need at least 100.")

        # Time-series cross validation (no future lookahead)
        tscv = TimeSeriesSplit(n_splits=5)
        fold_accs = []
        
        clf_gb = GradientBoostingClassifier(
            n_estimators=75,
            learning_rate=0.08,
            max_depth=3,
            subsample=0.85,
            random_state=42
        )
        clf_rf = RandomForestClassifier(
            n_estimators=100,
            max_depth=5,
            min_samples_split=4,
            random_state=42,
            n_jobs=-1
        )

        for train_idx, val_idx in tscv.split(X):
            X_tr, X_val = X.iloc[train_idx], X.iloc[val_idx]
            y_tr, y_val = y.iloc[train_idx], y.iloc[val_idx]
            
            clf_gb.fit(X_tr, y_tr)
            preds = clf_gb.predict(X_val)
            fold_accs.append(accuracy_score(y_val, preds))

        # Train final ensemble on full historical dataset
        ensemble = VotingClassifier(
            estimators=[
                ("gb", clf_gb),
                ("rf", clf_rf)
            ],
            voting="soft"
        )
        ensemble.fit(X, y)
        self.model = ensemble
        self.is_trained = True

        # Extract feature importances from the fitted RF estimator
        fitted_rf = ensemble.named_estimators_["rf"]
        importances = fitted_rf.feature_importances_
        feat_imp_dict = {
            col: round(float(imp), 4)
            for col, imp in sorted(zip(FEATURE_COLUMNS, importances), key=lambda x: x[1], reverse=True)
        }
        self.feature_importances = feat_imp_dict

        # Evaluate performance on most recent fold
        val_preds = ensemble.predict(X_val)
        prec, rec, f1, _ = precision_recall_fscore_support(y_val, val_preds, average="weighted", zero_division=0)
        
        self.metrics = {
            "accuracy": round(float(np.mean(fold_accs) * 100), 2),
            "precision": round(float(prec * 100), 2),
            "recall": round(float(rec * 100), 2),
            "f1": round(float(f1 * 100), 2),
            "cv_folds": 5,
            "samples_trained": len(X)
        }

        # Persist model
        try:
            joblib.dump({
                "model": self.model,
                "feature_importances": self.feature_importances,
                "metrics": self.metrics
            }, MODEL_PATH)
        except Exception as e:
            print(f"Notice: Failed to save model: {e}")

        return {
            "status": "success",
            "metrics": self.metrics,
            "top_features": list(self.feature_importances.items())[:8]
        }

    def predict(self, df: pd.DataFrame) -> dict:
        """
        Runs ML inference on the latest candle in the DataFrame.
        Returns predicted signal, probability distribution (BUY, HOLD, SELL), and confidence.
        """
        if not self.is_trained or self.model is None:
            # Auto-train if not yet trained
            self.train(df)

        df_feat = build_features(df)
        latest_features = df_feat[FEATURE_COLUMNS].iloc[[-1]]

        # Impute any edge NaNs with 0
        latest_features = latest_features.fillna(0.0)

        probs = self.model.predict_proba(latest_features)[0]
        classes = self.model.classes_

        prob_map = {0: 0.33, 1: 0.33, 2: 0.33}
        for cls, prob in zip(classes, probs):
            prob_map[cls] = float(prob)

        p_hold = round(prob_map.get(0, 0.0) * 100, 1)
        p_buy = round(prob_map.get(1, 0.0) * 100, 1)
        p_sell = round(prob_map.get(2, 0.0) * 100, 1)

        # Determine signal based on maximum probability with threshold
        if p_buy > p_sell and p_buy > 42.0:
            signal = "STRONG BUY" if p_buy > 60.0 else "BUY"
            confidence = p_buy
        elif p_sell > p_buy and p_sell > 42.0:
            signal = "STRONG SELL" if p_sell > 60.0 else "SELL"
            confidence = p_sell
        else:
            signal = "HOLD"
            confidence = p_hold

        return {
            "signal": signal,
            "confidence": confidence,
            "probabilities": {
                "buy": p_buy,
                "hold": p_hold,
                "sell": p_sell
            },
            "metrics": self.metrics,
            "feature_importances": self.feature_importances
        }

# Global singleton
predictor = CryptoPredictor()
