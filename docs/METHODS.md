# Scientific Methods & Calculations

## Data Transformations

SciGraph provides a robust engine for transforming raw data into analytical forms.

### Supported Functions

- **Natural Log**: `ln(x)`
- **Log Base 10**: `log₁₀(x)`
- **Square Root**: `√x`
- **Square**: `x²`
- **Reciprocal**: `1/x`
- **Absolute Value**: `|x|`
- **Multiplication**: `a × b` (Requires selecting a second column)

### Transform Chaining

Transforms can be composed using the **Wrap** function. For example, to calculate $ln(A \times B)$:

1. Select `a × b` as the inner transform.
2. Select `ln(x)` as the outer (wrap) transform.
3. The result is computed as $ln(column_A \times column_B)$.

## Analytical Engine

### Linear Regression ($B$)

The application performs automatic least-squares fitting on user-selected regions.

- **Input**: User-selected range of data points $[x_start, x_end]$.
- **Output**: Slope ($B$) and Intercept ($A$) of the best-fit line $y = Bx + A$.
- **Precision**: Calculations use double-precision floating-point arithmetic.

### Thermal Diffusivity ($\alpha$)

A specialized module for calculating thermal diffusivity using the laser flash analysis (LFA) method. Supports two test configurations selectable via a **Test Method** dropdown.

#### Direct (Transmission) Method

The laser pulse heats the **front face** of the sample. The temperature rise is recorded on the **rear face** and the slope of the linear region is used.

**Formula**:
$$ \alpha = \frac{\pi L^2}{B^2} $$

**Variables**:

- $L$: Sample thickness (mm) — entered manually.
- $B$: Slope from linear regression of the temperature-time rise curve.

#### Indirect (Reflection) Method

The laser pulse and temperature measurement both occur on the **same front surface**. Used when the rear face is inaccessible or when measuring through a medium/substrate.

**Formula**:
$$ \alpha = L^2 \cdot F_c $$

**Variables**:

- $L$: Sample thickness (mm) — entered manually.
- $F_c$: Multiplier factor — entered manually.

### Basic Statistics

Calculates summary statistics for the selected data region ($Y$ values).

- **Mean** ($\bar{y}$): Arithmetic average. $\bar{y} = \frac{1}{n}\sum_{i=1}^{n} y_i$
- **Median**: Middle value of the sorted dataset.
- **Standard Deviation** ($\sigma$): Measure of data dispersion. $\sigma = \sqrt{\frac{1}{n}\sum_{i=1}^{n} (y_i - \bar{y})^2}$ (Population Std Dev).
- **Min/Max**: The lowest and highest $Y$ values in the selected range.

### Area Under Curve (Integration)

Computes the definite integral of the selected region using the **Trapezoidal Rule**.

**Formula**:
$$ Area = \sum_{i=0}^{n-1} \frac{y_i + y_{i+1}}{2} \cdot (x_{i+1} - x_i) $$

This method approximates the area by dividing the region into trapezoids between consecutive data points.

### Peak Finder

Identifies the global maximum within the user-selected region.

- **Output**: The exact $(x, y)$ coordinates of the data point with the highest $y$ value.
- **Method**: Iterates through all points in the selection to find $P_{max} = \max \{ y_i \}$.

### Data Smoothing

Noise reduction filters for signal processing.

#### Moving Average

A simple low-pass filter that replaces each point with the average of its neighbors.

- **Formula**: $\hat{y}_i = \frac{1}{2k+1} \sum_{j=-i}^{i} y_{i+j}$
- **Best for**: Rapid noise reduction where peak preservation is not critical.
- **Window Size (N)**: Total number of points averaging (must be odd). $k = (N-1)/2$.

#### Savitzky-Golay

A digital filter that smooths data by fitting adjacent points to a low-degree polynomial.

- **Advantage**: Preserves higher moments of the data (peak height/width) better than moving averages.
- **Parameters**:
  - **Window Size**: Number of points (must be odd).
  - **Order**: Degree of polynomial (typically 2 or 3).
- **Implementation**: Uses pre-computed convolution coefficients.

- **Implementation**: Uses pre-computed convolution coefficients.

### Derivative Analysis

Calculates the rate of change or curvature of the signal using **Finite Difference** methods.

#### 1st Derivative ($dy/dx$)

Represents the slope of the tangent at each point. Useful for finding inflection points.

- **Method**: Central Difference (for interior points).
- **Formula**: $y'_i \approx \frac{y_{i+1} - y_{i-1}}{x_{i+1} - x_{i-1}}$

#### 2nd Derivative ($d^2y/dx^2$)

Represents the concavity or curvature. Useful for peak detection (negative curvature) and inflection points (zero crossing).

- **Method**: Central Difference.
- **Formula**: $y''_i \approx \frac{y_{i+1} - 2y_i + y_{i-1}}{(x_{i+1} - x_i)^2}$

## Extensibility

New physical models can be added via the plugin registry:

- **Registry File**: `src/analysis/registry.js`
- **Structure**: Each module defines `id`, `name`, `inputs` (e.g., thickness), and a `calculate` function that receives the slope and inputs.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for code-level details.
