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

## Extensibility

New physical models can be added via the plugin registry:

- **Registry File**: `src/analysis/registry.js`
- **Structure**: Each module defines `id`, `name`, `inputs` (e.g., thickness), and a `calculate` function that receives the slope and inputs.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for code-level details.
