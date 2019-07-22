# resources
 * https://pdfs.semanticscholar.org/847f/819a4ea14bd789aca8bc88e85e906cfc657c.pdf
 * https://mikeash.com/pyblog/fluid-simulation-for-dummies.html
 * https://www.youtube.com/watch?v=alhpH6ECFvQ

## Array size:
> We allocate an additional layer of grid cells around the fluid’s domain to
> simplify the treatment of the boundaries. 


## Arrays
Single dimension arrays for efficiency
```
u[size]
v[size] // velocity?
u_prev[size]
v_prev[size];  // velocity?

dens[size]
dens_prev[size]; 
```

Array sizes: `size=(N+2)*(N+2)`
Getting cell index: `cellIndex(i,j) => ((i)+(N+2)*(j))`  
Grid spacing: `h=1/N`  
Time spacing: `dt`  
sources array: `source[]`

Routine that adds the source to the density:
```
add_source(int N, float * x, float * s, float dt) {
  var size=(N+2)*(N+2);

  for (var i = 0; i < size; i++) {
    x[i] += dt * s[i];
  } 
}
```
A cell loses desity to its neighbors. But it also gains density overflowing from its neigbors. 
The net difference is: 

```
x0[IX(i-1,j)] + x0[IX(i+1,j)] + x0[IX(i,j-1)] + x0[IX(i,j+1)]- 4 * x0[IX(i,j)]
```
