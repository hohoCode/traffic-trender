package org.traffictrender.worker;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class ServletCacheKey {
	private Set<String> filterMenu;
	private String type, zoomlevel, size, color, y;
	private Boolean aggregated;
	public ServletCacheKey (final Map<String, String[]> paramMap) {
		if (paramMap != null) {
			String[] filter = paramMap.get("fm");
			if (filter != null && filter.length != 0) {
				filterMenu = new HashSet<String>();
				filterMenu.addAll(Arrays.asList(filter));
			}
			String[] types = paramMap.get("type");
			if (types != null && types.length != 0)
				type = types[0];
			String[] zoomlevels = paramMap.get("zoomlevel");
			if (zoomlevels != null && zoomlevels.length != 0)
				zoomlevel = zoomlevels[0];
			String[] sizes = paramMap.get("size");
			if (sizes != null && sizes.length != 0)
				size = sizes[0];
			String[] colors = paramMap.get("color");
			if (colors != null && colors.length != 0)
				color = colors[0];
			String[] ys = paramMap.get("y");
			if (ys != null && ys.length != 0)
				y = ys[0];
			aggregated = false;
			String[] aggre = paramMap.get("aggregated");
			if (aggre != null && aggre.length > 0 && aggre[0].toLowerCase().equals("true"))
				aggregated = true;
		}
	}
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result
				+ ((aggregated == null) ? 0 : aggregated.hashCode());
		result = prime * result + ((color == null) ? 0 : color.hashCode());
		result = prime * result
				+ ((filterMenu == null) ? 0 : filterMenu.hashCode());
		result = prime * result + ((size == null) ? 0 : size.hashCode());
		result = prime * result + ((type == null) ? 0 : type.hashCode());
		result = prime * result + ((y == null) ? 0 : y.hashCode());
		result = prime * result
				+ ((zoomlevel == null) ? 0 : zoomlevel.hashCode());
		return result;
	}
	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (obj == null) {
			return false;
		}
		if (!(obj instanceof ServletCacheKey)) {
			return false;
		}
		ServletCacheKey other = (ServletCacheKey) obj;
		if (type == null) {
			if (other.type != null) {
				return false;
			}
		} else if (!type.equals(other.type)) {
			return false;
		}
		if (zoomlevel == null) {
			if (other.zoomlevel != null) {
				return false;
			}
		} else if (!zoomlevel.equals(other.zoomlevel)) {
			return false;
		}
		if (aggregated == null) {
			if (other.aggregated != null) {
				return false;
			}
		} else if (!aggregated.equals(other.aggregated)) {
			return false;
		}
		if (y == null) {
			if (other.y != null) {
				return false;
			}
		} else if (!y.equals(other.y)) {
			return false;
		}
		if (color == null) {
			if (other.color != null) {
				return false;
			}
		} else if (!color.equals(other.color)) {
			return false;
		}
		if (size == null) {
			if (other.size != null) {
				return false;
			}
		} else if (!size.equals(other.size)) {
			return false;
		}
		if (filterMenu == null) {
			if (other.filterMenu != null) {
				return false;
			}
		} else if (!filterMenu.equals(other.filterMenu)) {
			return false;
		}

		return true;
	}
	
}
