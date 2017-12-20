(function() {
	angular.module('MockHelper', [])
	.factory('MockStorage', function($q) {
		let wrapper = this;
		wrapper.deferreds = {};
		let findById = (item) => item.id === id;
		let Factory = function(key) {
			this.idCount = 0;
			this.key = key;
			this.store = [];
			this.save = function() {
				localStorage.setItem(this.key, JSON.stringify(this.store));
			};
			this.load = function() {
				this.store = JSON.parse(localStorage.getItem(this.key)) || [];
			};
		};
		Factory.prototype.create = function(entity) {
			if (entity.id) {
				throw new Error('Impossible de créer une entité qui a déjà un ID.');
			}
			entity.id = this.idCount++;
			this.store.push(entity);
			this.save();
			return entity;
		};
		Factory.prototype.read = function(id) {
			return this.store.find(findById);
		}
		Factory.prototype.update = function(entity) {
			if (!entity.id) {
				throw new Error('Impossible de mettre à jour une entité sans ID.');
			}
			let index = this.store.findIndex(findById);
			if (index >= 0) {
				this.store.splice(index, 1, entity);
				this.save();
			}
		};
		Factory.prototype.delete = function(id) {
			if (!entity.id) {
				throw new Error('Impossible de supprimer une entité sans ID.');
			}
			let index = this.store.findIndex(findById);
			if (index >= 0) {
				this.store.splice(index, 1);
				this.save();
				return true;
			} else {
				return false;
			}
		}
		Factory.prototype.has = function(key) {
			return this.store.findIndex(findById) >= 0;
		};
		Factory.prototype.reinitialize = function() {
			this.store = [];
			localStorage.removeItem(this.key);
		};
		return {
			createInstance(key) {
				// Create a deferred if not exists
				if(!wrapper.deferreds[key]) {
					wrapper.deferreds[key] = $q.defer();
				}
				
				// Throw error if the deferred has already been resolved
				if(wrapper.deferreds[key].promise.$$state.status == 1) {
					throw new Error('Instance with key: "'+key+'" already created.');
				}

				// Resolve the deferred with a new instance
				let instance = new Factory(key);
				instance.load();
				wrapper.deferreds[key].resolve(instance);
					
				// Return the promise of the deferred
				return wrapper.deferreds[key].promise;			
			},
			getInstance(key) {
				// Create a deferred if not exists
				if (!wrapper.deferreds[key]) { 
					wrapper.deferreds[key] = $q.defer();
				}
				
				// Return the promise of the deferred
				return wrapper.deferreds[key].promise;
			}
		};
	});
})();