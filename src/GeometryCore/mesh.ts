import { Vector } from "../LinearAlgebra/vector";
import { Corner } from "./corner";
import { Edge } from "./edge";
import { Face } from "./face";
import { Halfedge } from "./halfedge";
import { Vertex } from "./vertex";

export class Mesh {
  vertices: Vertex[];
  edges: Edge[];
  faces: Face[];
  corners: Corner[];
  halfedges: Halfedge[];
  boundaries: Face[];
  generators: Array<Halfedge[]>;

  /**
   * This class represents a Mesh.
   * @constructor module:Core.Mesh
   * @property {module:Core.Vertex[]} vertices The vertices contained in this mesh.
   * @property {module:Core.Edge[]} edges The edges contained in this mesh.
   * @property {module:Core.Face[]} faces The faces contained in this mesh.
   * @property {module:Core.Corner[]} corners The corners contained in this mesh.
   * @property {module:Core.Halfedge[]} halfedges The halfedges contained in this mesh.
   * @property {module:Core.Face[]} boundaries The boundary loops contained in this mesh.
   * @property {Array.<module:Core.Halfedge[]>} generators An array of halfedge arrays, i.e.,
   * [[h11, h21, ..., hn1], [h12, h22, ..., hm2], ...] representing this mesh's
   * {@link https://en.wikipedia.org/wiki/Homology_(mathematics)#Surfaces homology generators}.
   */
  constructor() {
    this.vertices = [];
    this.edges = [];
    this.faces = [];
    this.corners = [];
    this.halfedges = [];
    this.boundaries = [];
    this.generators = [];
  }

  /**
   * Computes the euler characteristic of this mesh.
   * @method module:Core.Mesh#eulerCharacteristic
   * @returns {number}
   */
  eulerCharacteristic() {
    return this.vertices.length - this.edges.length + this.faces.length;
  }

  // build this mesh from buffer geometry from threejs
  buildFromGeometry(geometry: THREE.BufferGeometry) {
    const positions = geometry.getAttribute("position");
    const indexToVertex = new Map<number, Vertex>();

    this.vertices = [];
    this.faces = [];

    // create and insert vertices
    for (let i = 0; i < positions.count; i++) {
      let v = new Vertex(new Vector(positions.getX(i), positions.getY(i), positions.getZ(i)));
	  v.index = i;
      this.vertices.push(v);
      indexToVertex.set(i, v);
      if (i % 3 === 0) {
        this.faces.push(new Face());
      }
    }

    let eIndex = 0;
    const edgeCount = new Map();
    const existingHalfEdges = new Map();
    const hasTwinHalfEdge = new Map<Halfedge, boolean>();
    for (let I = 0; I < this.faces.length; I++) {
      const f = this.faces[I];

      // each face has three halfedges
      for (let J = 0; J < 3; J++) {
        const h = new Halfedge();
		h.index = 3 * I + J;
		
		// point current half edge and vertex to each other
		const v = indexToVertex.get(3*I+J)!;
		h.vertex = v;
		v.halfedge = h;

		h.face = f;
		f.halfedge = h;
        
		this.halfedges[3 * I + J] = h;
      }

      // initialize newly created half edges
      for (let J = 0; J < 3; J++) {
        const K = (J + 1) % 3;
        const i = 3 * I + J;
        const j = 3 * I + K;
        // set current half edge attribute
        const h = this.halfedges[i];
        h.next = this.halfedges[j];
        h.prev = this.halfedges[3 * I + ((J + 3 - 1) % 3)];
        h.onBoundary = false;
        hasTwinHalfEdge.set(h, false);

        // point current face and half edge to each other
		const from = h.vertex!.point;
		const to = h.next.vertex!.point;
		let key1 = `${from.toString()}${to.toString()}`;
		let key2 = `${to.toString()}${from.toString()}`;
		const has_key1 = existingHalfEdges.has(key1);
		const has_key2 = existingHalfEdges.has(key2);
		if (has_key1 || has_key2) {
			let twin = existingHalfEdges.get(has_key1 ? key1 : key2);
			h.twin = twin;
			twin.twin = h;
			h.edge = twin.edge;

			hasTwinHalfEdge.set(h, true);
			hasTwinHalfEdge.set(twin, true);
			edgeCount.set(has_key1 ? key1: key2, edgeCount.get(has_key1? key1: key2)+1)
		} else {
			const e = new Edge();
			this.edges[eIndex++] = e;
			h.edge = e;
			e.halfedge = h;

			existingHalfEdges.set(key1, h);
			edgeCount.set(key1, 1);
		}
      }
    }

	// create and insert boundary halfedges and imaginary faces for boundary cycles 
	// also create and insert cornors.

	let hIndex = this.halfedges.length;
	const halfEdgesLength = this.halfedges.length;
	let cIndex = 0;

	for(let i = 0; i < halfEdgesLength; i++) {
		const h = this.halfedges[i];
		if (!hasTwinHalfEdge.get(h)) {
			// create new face
			let f = new Face();
			this.boundaries.push(f);

			// walk along boundary cycle
			let boundaryCycle = [];
			let he = h;
			do {
				// create a new halfedge
				let bH = new Halfedge();
				this.halfedges[hIndex++] = bH;
				boundaryCycle.push(bH);

				// grab the next halfedge along the boundary that does not have a twin halfedge
				let nextHe = he.next!;
				while (hasTwinHalfEdge.get(nextHe)) {
					nextHe = nextHe.twin!.next!;
				}

				// set the current halfedge's attributes
				bH.vertex = nextHe.vertex;
				bH.edge = he.edge;
				bH.onBoundary = true;

				// point the new halfedge and face to each other
				bH.face = f;
				f.halfedge = bH;

				// point the new halfedge and he to each other
				bH.twin = he;
				he.twin = bH;

				// continue walk
				he = nextHe;
			} while (he !== h);

			// link the cycle of boundary halfedges together
			let n = boundaryCycle.length;
			for (let j = 0; j < n; j++) {
				boundaryCycle[j].next = boundaryCycle[(j + n - 1) % n]; // boundary halfedges are linked in clockwise order
				boundaryCycle[j].prev = boundaryCycle[(j + 1) % n];
				hasTwinHalfEdge.set(boundaryCycle[j], true);
				hasTwinHalfEdge.set(boundaryCycle[j].twin!, true);
			}
		}

		// point the newly created corner and its halfedge to each other
		if (!h.onBoundary) {
			let c = new Corner();
			c.halfedge = h;
			h.corner = c;

			this.corners[cIndex++] = c;
		}
	}

	// check if mesh has isolated vertices, isolated faces or
	// non-manifold vertices
	if (this.hasIsolatedVertices() ||
		this.hasIsolatedFaces() ||
		this.hasNonManifoldVertices()) {
		return false;
	}
	// index elements
	this.indexElements();
	
	return true;
  }

  /**
   * Preallocates mesh elements.
   * @private
   * @method module:Core.Mesh#preallocateElements
   * @param {module:LinearAlgebra.Vector[]} positions The vertex positions of a polygon soup mesh.
   * @param {number[]} indices The indices of a polygon soup mesh.
   */
  preallocateElements(positions: Vector[], indices: number[]) {
    let nBoundaryHalfedges = 0;
    let sortedEdges = new Map();
    for (let I = 0; I < indices.length; I += 3) {
      for (let J = 0; J < 3; J++) {
        let K = (J + 1) % 3;
        let i = indices[I + J];
        let j = indices[I + K];

        // swap if i > j
        if (i > j) j = [i, (i = j)][0];

        let value = [i, j];
        let key = value.toString();
        if (sortedEdges.has(key)) {
          nBoundaryHalfedges--;
        } else {
          sortedEdges.set(key, value);
          nBoundaryHalfedges++;
        }
      }
    }

    let nVertices = positions.length;
    let nEdges = sortedEdges.size;
    let nFaces = indices.length / 3;
    let nHalfedges = 2 * nEdges;
    let nInteriorHalfedges = nHalfedges - nBoundaryHalfedges;

    // clear arrays
    this.vertices.length = 0;
    this.edges.length = 0;
    this.faces.length = 0;
    this.halfedges.length = 0;
    this.corners.length = 0;
    this.boundaries.length = 0;
    this.generators.length = 0;

    // allocate space
    this.vertices = new Array(nVertices);
    this.edges = new Array(nEdges);
    this.faces = new Array(nFaces);
    this.halfedges = new Array(nHalfedges);
    this.corners = new Array(nInteriorHalfedges);
  }

  /**
   * Checks whether this mesh has isolated vertices.
   * @private
   * @method module:Core.Mesh#hasIsolatedVertices
   * @returns {boolean}
   */
  hasIsolatedVertices() {
    for (let v of this.vertices) {
      if (v.isIsolated()) {
        alert("Mesh has isolated vertices!");
        return true;
      }
    }

    return false;
  }

  /**
   * Checks whether this mesh has isolated faces.
   * @private
   * @method module:Core.Mesh#hasIsolatedFaces
   * @returns {boolean}
   */
  hasIsolatedFaces() {
    for (let f of this.faces) {
      let boundaryEdges = 0;
      for (let h of f.adjacentHalfedges()) {
        if (h!.twin!.onBoundary) boundaryEdges++;
      }

      if (boundaryEdges === 3) {
        alert("Mesh has isolated faces!");
        return true;
      }
    }

    return false;
  }

  /**
   * Checks whether this mesh has non-manifold vertices.
   * @private
   * @method module:Core.Mesh#hasNonManifoldVertices
   * @returns {boolean}
   */
  hasNonManifoldVertices() {
    let adjacentFaces = new Map();
    for (let v of this.vertices) {
      adjacentFaces.set(v, 0);
    }

    for (let f of this.faces) {
      for (let v of f.adjacentVertices()) {
        adjacentFaces.set(v, adjacentFaces.get(v) + 1);
      }
    }

    for (let b of this.boundaries) {
      for (let v of b.adjacentVertices()) {
        adjacentFaces.set(v, adjacentFaces.get(v) + 1);
      }
    }

    for (let v of this.vertices) {
      if (adjacentFaces.get(v) !== v.degree()) {
        return true;
      }
    }

    return false;
  }

  /**
   * Assigns indices to this mesh's elements.
   * @private
   * @method module:Core.Mesh#indexElements
   */
  indexElements() {
    let index = 0;
    for (let v of this.vertices) {
      v.index = index++;
    }

    index = 0;
    for (let e of this.edges) {
      e.index = index++;
    }

    index = 0;
    for (let f of this.faces) {
      f.index = index++;
    }

    index = 0;
    for (let h of this.halfedges) {
      h.index = index++;
    }

    index = 0;
    for (let c of this.corners) {
      c.index = index++;
    }

    index = 0;
    for (let b of this.boundaries) {
      b.index = index++;
    }
  }
}

/**
 * Assigns an index to each element in elementList. Indices can be accessed by using
 * elements as keys in the returned dictionary.
 * @global
 * @function module:Core.indexElements
 * @param {Object[]} elementList An array of any one of the following mesh elements -
 * vertices, edges, faces, corners, halfedges, boundaries.
 * @returns {Object} A dictionary mapping each element in elementList to a unique index
 * between 0 and |elementList|-1.
 * @example
 * let vertexIndex = indexElements(mesh.vertices);
 * let v = mesh.vertices[0];
 * let i = vertexIndex[v];
 * console.log(i); // prints 0
 */
export function indexElements(elementList: any[]) {
  let i = 0;
  let index: any = {};
  for (let element of elementList) {
    index[element] = i++;
  }

  return index;
}
