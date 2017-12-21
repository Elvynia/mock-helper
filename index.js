(function() {
	angular.module('MockHelper', [])
	.factory('MockStorage', function($q) {
		let wrapper = this;
		wrapper.deferreds = {};
		let Factory = function(key) {
			this.idCount = 0;
			this.key = key;
			this.store = [];
			this.save = function() {
				localStorage.setItem(this.key, JSON.stringify(this.store));
			};
			this.load = function() {
				this.store = JSON.parse(localStorage.getItem(this.key)) || [];
				let tmp = this.store.map((item) => item.id).sort();
				this.idCount = tmp[tmp.length - 1] + 1 || 0;
				console.log('MockStotage factory for "%s" loaded %s entities.', this.key, this.store.length);
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
			return this.store.find((item) => item.id === id);
		}
		Factory.prototype.update = function(entity) {
			if (!entity.id && entity.id !== 0) {
				throw new Error('Impossible de mettre à jour une entité sans ID.');
			}
			let index = this.store.findIndex((item) => item.id === entity.id);
			if (index >= 0) {
				this.store.splice(index, 1, entity);
				this.save();
			} else {
				console.warn('Impossible de mettre à jour l\'entité car'
					+ ' aucun ID %s n\'a été trouvé', entity.id);
			}
		};
		Factory.prototype.delete = function(id) {
			if (!id && id !== 0) {
				throw new Error('Impossible de supprimer une entité sans ID.');
			}
			let index = this.store.findIndex((item) => item.id === id);
			if (index >= 0) {
				this.store.splice(index, 1);
				this.save();
				return true;
			} else {
				return false;
			}
		}
		Factory.prototype.has = function(id) {
			return this.store.findIndex((item) => item.id === id) >= 0;
		};
		Factory.prototype.list = function() {
			return this.store;
		};
		Factory.prototype.reinitialize = function() {
			this.store.splice(0, this.store.length);
			this.save();
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