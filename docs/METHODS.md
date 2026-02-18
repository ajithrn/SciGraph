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

### Thermal Diffusivity ($D$)

A specialized module for calculating thermal diffusivity based on the Angstrom method or similar linear relationships.

**Formula**:
$$ D = \frac{\pi L^2}{B^2} $$

**Variables**:

- $L$: Sample Thickness (mm). This value is entered manually in the analysis panel.
- $B$: Slope of the linear regression from a plot of Phase vs $\sqrt{Frequency}$ (or similar linearized form).

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

## Extensibility

New physical models can be added via the plugin registry:

- **Registry File**: `src/analysis/registry.js`
- **Structure**: Each module defines `id`, `name`, `inputs` (e.g., thickness), and a `calculate` function that receives the slope and inputs.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for code-level details.
