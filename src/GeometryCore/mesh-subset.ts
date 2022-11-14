export class MeshSubset {
        vertices: Set<number>;
        edges: Set<number>;
        faces: Set<number>
        /**
         * This class represents a subset of a {@link module:Core.Mesh Mesh}
         * @constructor module:Core.MeshSubset
         * @param {Set.<number>} vertices A set of the indices of the vertices which this subset should contain. Default value is the empty set.
         * @param {Set.<number>} edges A set of the indices of the edges which this subset should contain. Default value is the empty set.
         * @param {Set.<number>} faces A set of the indices of the faces which this subset should contain. Default value is the empty set.
         * @property {Set.<number>} vertices The set of the indices of the vertices which this subset contains.
         * @property {Set.<number>} edges The set of the indices of the edges which this subset contains.
         * @property {Set.<number>} faces The set of the indices of the faces which this subset contains.
         */
        constructor(vertices = new Set<number>(), edges = new Set<number>(), faces = new Set<number>()) {
                this.vertices = vertices;
                this.edges = edges;
                this.faces = faces;
        }

        /**
         * Makes a copy of a {@link moduel:Core.MeshSubset}
         * @method module:Core.MeshSubset.deepCopy
         * @param {module:Core.MeshSubset} subset The subset to copy.
         * @returns {module:Core.MeshSubset} A copy of the given subset.
         */
        static deepCopy(subset: MeshSubset) {
                return new MeshSubset(new Set(subset.vertices),
                                      new Set(subset.edges), new Set(subset.faces));
        }

        /**
         * Resets this subset (i.e. empties out the vertex, edge, and face sets)
         * @method module:Core.Meshsubset#reset
         */
        reset() {
                this.vertices = new Set();
                this.edges = new Set();
                this.faces = new Set();
        }

        /**
         * Adds a vertex to this subset
         * @method module:Core.MeshSubset#addVertex
         * @param {number} vertex The index of the vertex to add.
         */
        addVertex(vertex: number) {
                this.vertices.add(vertex);
        }

        /**
         * Adds set of vertices to this subset
         * @method module:Core.MeshSubset#addVertices
         * @param {Set.<number>} vertices The set of indices of vertices to add.
         */
        addVertices(vertices: Set<number>) {
                for (let v of vertices) {
                        this.addVertex(v);
                }
        }

        /**
         * Removes a vertex from this subset.
         * @method module:Core.MeshSubset#deleteVertex
         * @param {number} vertex The index of the vertex to remove.
         */
        deleteVertex(vertex: number) {
                this.vertices.delete(vertex);
        }

        /**
         * Removes a set of vertices from this subset.
         * @method module:Core.MeshSubset#deleteVertices
         * @param {Set.<number>} vertices The indices of vertices to remove.
         */
        deleteVertices(vertices: Set<number>) {
                for (let v of vertices) {
                        this.deleteVertex(v);
                }
        }

        /**
         * Adds an edge to this subset
         * @method module:Core.MeshSubset#addEdge
         * @param {number} edge The index of the edge to add.
         */
        addEdge(edge: number) {
                this.edges.add(edge);
        }

        /**
         * Adds set of edges to this subset
         * @method module:Core.MeshSubset#addEdges
         * @param {number} edges The set of indices of edges to add.
         */
        addEdges(edges: Set<number>) {
                for (let e of edges) {
                        this.addEdge(e);
                }
        }

        /**
         * Removes an edge from this subset.
         * @method module:Core.MeshSubset#deleteEdge
         * @param {number} edge The index of the edge to remove.
         */
        deleteEdge(edge:number) {
                this.edges.delete(edge);
        }

        /**
         * Removes a set of edges from this subset.
         * @method module:Core.MeshSubset#deleteEdges
         * @param {Set.<number>} edges The indices of the edges to remove.
         */
        deleteEdges(edges: Set<number>) {
                for (let e of edges) {
                        this.deleteEdge(e);
                }
        }

        /**
         * Adds a face to this subset
         * @method module:Core.MeshSubset#addFace
         * @param {number} face The index of the face to add.
         */
        addFace(face: number) {
                this.faces.add(face);
        }

        /**
         * Adds set of faces to this subset
         * @method module:Core.MeshSubset#addFaces
         * @param {number} faces The set of indices of faces to add.
         */
        addFaces(faces: Set<number>) {
                for (let f of faces) {
                        this.addFace(f);
                }
        }

        /**
         * Removes a face from this subset.
         * @method module:Core.MeshSubset#deleteFace
         * @param {number} face The index of the face to remove.
         */
        deleteFace(face: number) {
                this.faces.delete(face);
        }

        /**
         * Removes a set of faces from this subset.
         * @method module:Core.MeshSubset#deleteFaces
         * @param {Set.<number>} faces The indices of the faces to remove.
         */
        deleteFaces(fs: Set<number>) {
                for (let f of fs) {
                        this.deleteFace(f);
                }
        }

        /**
         * Adds a subset's vertices, edges, and faces to this subset.
         * @method module:Core.MeshSubset#addSubset
         * @param {module:Core.MeshSubset} subset The subset to add in.
         */
        addSubset(subset: MeshSubset) {
                this.addVertices(subset.vertices);
                this.addEdges(subset.edges);
                this.addFaces(subset.faces);
        }

        /**
         * Removes a subset's vertices, edges, and faces from this subset.
         * @method module:Core.MeshSubset#deleteSubset
         * @param {module:Core.MeshSubset} subset The subset to remove.
         */
        deleteSubset(subset: MeshSubset) {
                this.deleteVertices(subset.vertices);
                this.deleteEdges(subset.edges);
                this.deleteFaces(subset.faces);
        }

        /**
         * Returns true if the input subset contains the same vertices, edges, and faces as
         * this subset and false otherwise.
         * @method module:Core.MeshSubset#equals
         * @param {module:Core.MeshSubset} subset The subset to compare to.
         */
        equals(subset: MeshSubset) {
                return this.setsEqual(this.vertices, subset.vertices)
                        && this.setsEqual(this.edges, subset.edges)
                        && this.setsEqual(this.faces, subset.faces);
        }

        /**
         * Returns true if the two sets contain the same elements and false otherwise.
         * @private
         * @method module:Core.MeshSubset#setsEqual
         * @param {Set.<number>} as A set of numbers.
         * @param {Set.<number>} bs A set of numbers.
         * @returns {boolean} True if the sets contain the same elements and false otherwise.
         */
        setsEqual(as: Set<number>, bs: Set<number>) {
                if (as.size != bs.size) {
                        return false 
                } 
                for (let a of as) {
                        if (!bs.has(a)) {
                                return false; 
                        } 
                }
                return true;
        }
}
